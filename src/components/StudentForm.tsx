import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

// رابط Google Apps Script - ضع رابط الـ Web App الخاص بك هنا
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe1sABQ8QAjxiPFH9ydaVVLg3ztMTQU7nGUA01qmEcb5uQ8fn4JXH9POgfkBqkX9cL/exec";

// رابط n8n Webhook - ضع رابط الـ webhook الخاص بك هنا
const N8N_WEBHOOK_URL = "https://n8n.jadallah.work/webhook-test/training-plan";

interface FormData {
  studentName: string;
  recipient: string;
  group: string;
  planType: string;
  planElement: string;
  day1: string;
  day2: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  planDuration: string;
}

interface SheetData {
  groups: string[];
  planTypes: { [key: string]: string[] };
  recipients: string[];
  days: string[];
}

interface StudentFormProps {
  onSubmit: (data: FormData) => void;
  setPdfUrl: (url: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const StudentForm = ({ onSubmit, setPdfUrl, setIsLoading }: StudentFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    recipient: "",
    group: "",
    planType: "",
    planElement: "",
    day1: "",
    day2: "",
    startDay: "",
    startMonth: "",
    startYear: "",
    planDuration: "",
  });

  const [sheetData, setSheetData] = useState<SheetData>({
    groups: [],
    planTypes: {},
    recipients: [],
    days: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
  });

  const [availableElements, setAvailableElements] = useState<string[]>([]);

  // جلب البيانات من Google Sheets
  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    // التحقق من أن الـ URL ليس placeholder
    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      toast({
        title: "تنبيه",
        description: "يرجى إضافة رابط Google Apps Script في الكود أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("الاستجابة ليست بصيغة JSON");
      }
      
      const data = await response.json();
      setSheetData({
        ...sheetData,
        groups: data.groups || [],
        planTypes: data.planTypes || {},
        recipients: data.recipients || [],
      });
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "تأكد من رابط Google Apps Script في الكود",
        variant: "destructive",
      });
    }
  };

  // تحديث عناصر الخطة عند تغيير نوع الخطة
  useEffect(() => {
    if (formData.planType && sheetData.planTypes[formData.planType]) {
      setAvailableElements(sheetData.planTypes[formData.planType]);
      setFormData({ ...formData, planElement: "" });
    }
  }, [formData.planType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من البيانات
    if (!formData.studentName || !formData.recipient || !formData.group || !formData.planType || 
        !formData.planElement || !formData.day1 || !formData.day2 ||
        !formData.startDay || !formData.startMonth || !formData.startYear || 
        !formData.planDuration) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    // التحقق من أن الـ N8N URL ليس placeholder
    if (N8N_WEBHOOK_URL === "YOUR_N8N_WEBHOOK_URL_HERE") {
      toast({
        title: "تنبيه",
        description: "يرجى إضافة رابط n8n Webhook في الكود أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // إرسال البيانات إلى n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        toast({
          title: "تم بنجاح!",
          description: "تم إنشاء ملف PDF",
        });
      } else {
        throw new Error("لم يتم استلام رابط PDF");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ في إرسال البيانات",
        description: error instanceof Error ? error.message : "تأكد من رابط n8n Webhook",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      {/* اسم الطالب والمستلم في صف واحد على الشاشات الكبيرة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentName" className="text-base md:text-lg font-semibold text-foreground">
            اسم الطالب
          </Label>
          <Input
            id="studentName"
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            placeholder="أدخل اسم الطالب"
            className="text-right bg-card border-2 border-border focus:border-primary transition-all h-11 md:h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-base md:text-lg font-semibold text-foreground">
            المستلم
          </Label>
          <Select value={formData.recipient} onValueChange={(value) => setFormData({ ...formData, recipient: value })}>
            <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12">
              <SelectValue placeholder="اختر المستلم" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-border z-50">
              {sheetData.recipients.map((recipient) => (
                <SelectItem key={recipient} value={recipient} className="text-right">
                  {recipient}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* المجموعة */}
      <div className="space-y-2">
        <Label htmlFor="group" className="text-base md:text-lg font-semibold text-foreground">
          المجموعة
        </Label>
        <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value })}>
          <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12">
            <SelectValue placeholder="اختر المجموعة" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border z-50">
            {sheetData.groups.map((group) => (
              <SelectItem key={group} value={group} className="text-right">
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* نوع الخطة وعناصرها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="planType" className="text-base md:text-lg font-semibold text-foreground">
            نوع الخطة
          </Label>
          <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
            <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12">
              <SelectValue placeholder="اختر نوع الخطة" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-border z-50">
              {Object.keys(sheetData.planTypes).map((type) => (
                <SelectItem key={type} value={type} className="text-right">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="planElement" className="text-base md:text-lg font-semibold text-foreground">
            عنصر الخطة
          </Label>
          <Select 
            value={formData.planElement} 
            onValueChange={(value) => setFormData({ ...formData, planElement: value })}
            disabled={!formData.planType}
          >
            <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12 disabled:opacity-50">
              <SelectValue placeholder="اختر عنصر الخطة" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-border z-50">
              {availableElements.map((element) => (
                <SelectItem key={element} value={element} className="text-right">
                  {element}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* أيام الدوام */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="day1" className="text-base md:text-lg font-semibold text-foreground">
            اليوم الأول
          </Label>
          <Select value={formData.day1} onValueChange={(value) => setFormData({ ...formData, day1: value })}>
            <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12">
              <SelectValue placeholder="اختر اليوم الأول" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-border z-50">
              {sheetData.days.map((day) => (
                <SelectItem key={day} value={day} className="text-right">
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day2" className="text-base md:text-lg font-semibold text-foreground">
            اليوم الثاني
          </Label>
          <Select value={formData.day2} onValueChange={(value) => setFormData({ ...formData, day2: value })}>
            <SelectTrigger className="text-right bg-card border-2 border-border h-11 md:h-12">
              <SelectValue placeholder="اختر اليوم الثاني" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-border z-50">
              {sheetData.days.filter(day => day !== formData.day1).map((day) => (
                <SelectItem key={day} value={day} className="text-right">
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* تاريخ البداية */}
      <div className="space-y-2">
        <Label className="text-base md:text-lg font-semibold text-foreground">تاريخ البداية</Label>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.startDay}
              onChange={(e) => setFormData({ ...formData, startDay: e.target.value })}
              placeholder="اليوم"
              className="text-center bg-card border-2 border-border h-11 md:h-12 text-base"
            />
          </div>
          <div>
            <Input
              type="number"
              min="1"
              max="12"
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
              placeholder="الشهر"
              className="text-center bg-card border-2 border-border h-11 md:h-12 text-base"
            />
          </div>
          <div>
            <Input
              type="number"
              min="2024"
              max="2030"
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
              placeholder="السنة"
              className="text-center bg-card border-2 border-border h-11 md:h-12 text-base"
            />
          </div>
        </div>
      </div>

      {/* مدة الخطة */}
      <div className="space-y-2">
        <Label htmlFor="planDuration" className="text-base md:text-lg font-semibold text-foreground">
          مدة الخطة (بالأيام)
        </Label>
        <Input
          id="planDuration"
          type="number"
          min="1"
          value={formData.planDuration}
          onChange={(e) => setFormData({ ...formData, planDuration: e.target.value })}
          placeholder="أدخل عدد الأيام"
          className="text-right bg-card border-2 border-border h-11 md:h-12 text-base"
        />
      </div>

      {/* زر الإرسال */}
      <Button 
        type="submit" 
        className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-[1.02] mt-2"
      >
        <Send className="ml-2 h-5 w-5" />
        إنشاء ملف PDF
      </Button>
    </form>
  );
};
