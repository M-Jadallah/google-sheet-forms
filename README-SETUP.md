# دليل الإعداد الكامل - نظام إنشاء خطط الطلاب

## 📋 نظرة عامة
نظام متكامل لإنشاء ملفات PDF تلقائياً لخطط الطلاب باستخدام:
- **الواجهة**: React + TypeScript + Tailwind CSS
- **مصدر البيانات**: Google Sheets عبر Apps Script
- **معالجة PDF**: n8n Workflow
- **الاستضافة**: Coolify

---

## 1️⃣ إعداد Google Sheets

### الخطوة الأولى: إنشاء الملف
1. أنشئ ملف Google Sheets جديد
2. أنشئ ورقتين:
   - **ورقة 1**: سمّها "المجموعات"
   - **ورقة 2**: سمّها "أنواع الخطط"

### الخطوة الثانية: هيكلة البيانات

**ورقة "المجموعات":**
```
| المجموعة     |
|--------------|
| المجموعة أ   |
| المجموعة ب   |
| المجموعة ج   |
```

**ورقة "أنواع الخطط":**
```
| نوع الخطة    | عنصر الخطة  |
|--------------|-------------|
| خطة القراءة  | مستوى 1     |
| خطة القراءة  | مستوى 2     |
| خطة الحفظ    | جزء عم      |
| خطة الحفظ    | جزء تبارك   |
```

### الخطوة الثالثة: إضافة Apps Script

1. في ملف Google Sheets، اذهب إلى: **Extensions > Apps Script**
2. احذف الكود الموجود
3. انسخ الكود من ملف `google-apps-script/Code.gs`
4. احفظ المشروع (Ctrl+S أو File > Save)
5. اذهب إلى: **Deploy > New deployment**
6. اختر نوع **Web app**
7. الإعدادات:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
8. انقر **Deploy**
9. **احفظ الرابط الذي سيظهر** (سيكون مثل: https://script.google.com/macros/s/...)

---

## 2️⃣ إعداد n8n Workflow

### الخطوة الأولى: إنشاء Workflow جديد

1. افتح n8n وأنشئ workflow جديد
2. أضف **Webhook node** كبداية
3. في إعدادات Webhook:
   - **HTTP Method**: POST
   - **Path**: student-plan (أو أي مسار تريده)
4. **احفظ رابط Webhook** (سيظهر في الـ node)

### الخطوة الثانية: معالجة البيانات

أضف nodes التالية:

1. **Code Node** - لمعالجة البيانات:
```javascript
// استقبال البيانات من الفورم
const formData = items[0].json.body;

// تنسيق التاريخ
const startDate = `${formData.startDay}/${formData.startMonth}/${formData.startYear}`;

// إعداد البيانات لـ PDF
return [{
  json: {
    studentName: formData.studentName,
    group: formData.group,
    planType: formData.planType,
    planElement: formData.planElement,
    day1: formData.day1,
    day2: formData.day2,
    startDate: startDate,
    planDuration: formData.planDuration
  }
}];
```

2. **HTTP Request Node** - لتوليد PDF:
   - استخدم خدمة مثل:
     - PDFMonkey
     - DocRaptor
     - أو API خاص بك
   - أو استخدم **Code Node** مع مكتبة `pdfmake`

3. **Code Node** - لإرجاع رابط PDF:
```javascript
// افترض أن PDF تم توليده ورفعه
const pdfUrl = items[0].json.pdfUrl; // من الخطوة السابقة

return [{
  json: {
    pdfUrl: pdfUrl,
    success: true,
    message: "تم إنشاء الملف بنجاح"
  }
}];
```

4. **Respond to Webhook Node** - لإرجاع النتيجة

### مثال workflow مبسط:
```
Webhook → Code (تنسيق) → PDF Generator → Code (رد) → Respond
```

---

## 3️⃣ تكوين الكود

### الخطوة الأولى: تحديث الروابط

افتح ملف `src/components/StudentForm.tsx` وحدّث:

```typescript
// ضع رابط Google Apps Script الذي حصلت عليه
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// ضع رابط n8n Webhook الذي حصلت عليه
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/student-plan";
```

---

## 4️⃣ استضافة على Coolify

### الخطوة الأولى: إعداد المشروع

1. تأكد من وجود ملف `Dockerfile` في المشروع:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### الخطوة الثانية: النشر على Coolify

1. افتح Coolify Dashboard
2. أنشئ مشروع جديد
3. اختر **Docker Compose** أو **Dockerfile**
4. اربط repository الخاص بك
5. في إعدادات Build:
   - **Build Command**: `npm run build`
   - **Start Command**: (يتم تلقائياً من Dockerfile)

### الخطوة الثالثة: ربط Subdomain

1. في Coolify، اذهب إلى إعدادات المشروع
2. اذهب إلى **Domains**
3. أضف subdomain (مثل: students.yourdomain.com)
4. Coolify سيُعد SSL تلقائياً

---

## 5️⃣ اختبار النظام

### اختبار Google Apps Script
1. افتح الرابط مباشرة في المتصفح
2. يجب أن ترى JSON يحتوي على:
```json
{
  "success": true,
  "groups": ["المجموعة أ", "المجموعة ب"],
  "planTypes": {...},
  "days": [...]
}
```

### اختبار n8n Webhook
استخدم curl أو Postman:
```bash
curl -X POST https://your-n8n.com/webhook/student-plan \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "أحمد محمد",
    "group": "المجموعة أ",
    "planType": "خطة القراءة",
    "planElement": "مستوى 1",
    "day1": "السبت",
    "day2": "الاثنين",
    "startDay": "1",
    "startMonth": "1",
    "startYear": "2025",
    "planDuration": "30"
  }'
```

### اختبار الواجهة
1. افتح الموقع على subdomain الخاص بك
2. املأ الفورم
3. اضغط "إنشاء ملف PDF"
4. تأكد من ظهور رابط التحميل

---

## 🔧 استكشاف الأخطاء

### لا تظهر المجموعات في القائمة المنسدلة:
- تأكد من رابط Google Apps Script صحيح
- افتح Console في المتصفح (F12) وتحقق من الأخطاء
- تأكد من أن Apps Script منشور بإعدادات "Anyone"

### خطأ في إرسال البيانات إلى n8n:
- تأكد من رابط Webhook صحيح
- تأكد من أن workflow نشط (Active)
- تحقق من logs في n8n

### لا يظهر رابط PDF:
- تأكد من أن n8n يرجع `pdfUrl` في الاستجابة
- تحقق من Network tab في المتصفح
- تأكد من CORS معطّل في n8n webhook settings

---

## 📚 الموارد المفيدة

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [n8n Documentation](https://docs.n8n.io/)
- [Coolify Documentation](https://coolify.io/docs)
- [React Documentation](https://react.dev/)

---

## 📝 ملاحظات إضافية

- **الأمان**: روابط Webhook عامة، استخدم authentication إذا لزم الأمر
- **السعة**: n8n المجاني له حد شهري، راقب الاستخدام
- **التكلفة**: Coolify مجاني للاستضافة الذاتية
- **النسخ الاحتياطي**: احتفظ بنسخة من Google Sheets

---

**نجاح التنفيذ!** 🎉

لأي أسئلة أو مشاكل، تحقق من الـ logs في:
- Browser Console (F12)
- n8n Execution logs
- Coolify deployment logs
