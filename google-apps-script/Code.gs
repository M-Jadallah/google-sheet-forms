/**
 * Google Apps Script للتكامل مع فورم الطلاب
 * 
 * الإعداد:
 * 1. افتح ملف Google Sheets الخاص بك
 * 2. انتقل إلى Extensions > Apps Script
 * 3. احذف الكود الموجود والصق هذا الكود
 * 4. احفظ المشروع بأي اسم تريده
 * 5. انقر على Deploy > New deployment
 * 6. اختر "Web app" كنوع
 * 7. في Execute as: اختر "Me"
 * 8. في Who has access: اختر "Anyone"
 * 9. انقر Deploy واحفظ الرابط الذي سيظهر
 * 10. ضع هذا الرابط في StudentForm.tsx في المتغير GOOGLE_SCRIPT_URL
 */

function doGet(e) {
  try {
    // احصل على ورقة العمل النشطة
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // البيانات من الأوراق المختلفة
    const groupsSheet = sheet.getSheetByName("المجموعات") || sheet.getSheets()[0];
    const planTypesSheet = sheet.getSheetByName("أنواع الخطط") || sheet.getSheets()[1];
    
    // قراءة المجموعات (من العمود الأول، تجاهل السطر الأول "العنوان")
    const groupsData = groupsSheet.getRange("A2:A" + groupsSheet.getLastRow()).getValues();
    const groups = groupsData
      .map(row => row[0])
      .filter(val => val !== "");
    
    // قراءة أنواع الخطط وعناصرها
    // الهيكل المتوقع:
    // العمود A: نوع الخطة
    // العمود B: عنصر الخطة
    const planTypesData = planTypesSheet.getRange("A2:B" + planTypesSheet.getLastRow()).getValues();
    
    const planTypes = {};
    planTypesData.forEach(row => {
      const planType = row[0];
      const planElement = row[1];
      
      if (planType && planElement) {
        if (!planTypes[planType]) {
          planTypes[planType] = [];
        }
        if (!planTypes[planType].includes(planElement)) {
          planTypes[planType].push(planElement);
        }
      }
    });
    
    // إرجاع البيانات بصيغة JSON
    const response = {
      success: true,
      groups: groups,
      planTypes: planTypes,
      days: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * هيكل ملف Google Sheets المتوقع:
 * 
 * Sheet 1: "المجموعات"
 * | المجموعة  |
 * |-----------|
 * | المجموعة أ |
 * | المجموعة ب |
 * | المجموعة ج |
 * 
 * Sheet 2: "أنواع الخطط"
 * | نوع الخطة | عنصر الخطة |
 * |-----------|------------|
 * | خطة أ     | عنصر 1     |
 * | خطة أ     | عنصر 2     |
 * | خطة ب     | عنصر 1     |
 * | خطة ب     | عنصر 3     |
 */
