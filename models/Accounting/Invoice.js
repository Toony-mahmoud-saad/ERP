const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الفاتورة'],
    unique: true
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
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'المجموع الفرعي لا يمكن أن يكون سلبياً']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'قيمة الضريبة لا يمكن أن تكون سلبية']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'الخصم لا يمكن أن يكون سلبياً']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'الإجمالي لا يمكن أن يكون سلبياً']
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

// Middleware لحساب المجموع الفرعي والضريبة والإجمالي قبل الحفظ
invoiceSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  this.taxAmount = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  this.total = this.subtotal + this.taxAmount - this.discount;
  
  // تحديث حالة الدفع
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);