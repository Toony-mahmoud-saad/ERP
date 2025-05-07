const mongoose = require('mongoose');
// فواتير
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الفاتورة'],
    unique: true,
    default: function () {
      return `INV-${Date.now()}`;
    }
  },
  type: {
    type: String,
    enum: ['sale', 'purchase'],
    required: [true, 'الرجاء تحديد نوع الفاتورة']
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'الرجاء تحديد العميل/المورد'],
    refPath: 'partyType'
  },
  partyType: {
    type: String,
    enum: ['Customer', 'Supplier'],
    required: true
  },
  date: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ الفاتورة'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ الاستحقاق']
  },
  items: [{
    description: {
      type: String,
      required: [true, 'الرجاء إدخال وصف الصنف']
    },
    quantity: {
      type: Number,
      required: [true, 'الرجاء إدخال الكمية'],
      min: [1, 'الكمية يجب أن تكون على الأقل 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'الرجاء إدخال سعر الوحدة'],
      min: [0, 'السعر لا يمكن أن يكون سلبياً']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'نسبة الضريبة لا يمكن أن تكون سلبية']
    }
  }],
  discount: {
    type: Number,
    default: 0,
    min: [0, 'الخصم لا يمكن أن يكون سلبياً']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'المبلغ المدفوع لا يمكن أن يكون سلبياً']
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'cheque', null],
    default: null
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB'
  }
}, { timestamps: true });

// Virtual fields for automatic calculations
invoiceSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

invoiceSchema.virtual('taxAmount').get(function() {
  return this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
});

invoiceSchema.virtual('total').get(function() {
  return this.subtotal + this.taxAmount - this.discount;
});

// Middleware to update the status before saving
invoiceSchema.pre('save', function(next) {
  // Update payment status
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
  
  next();
});

// Ensure virtual fields are included in JSON and Object responses
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
