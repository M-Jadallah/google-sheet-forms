import { useState, useEffect } from "react";
import { StudentForm } from "@/components/StudentForm";
import { DownloadResult } from "@/components/DownloadResult";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-top duration-700">
            نظام إنشاء خطط الطلاب
          </h1>
          <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-top duration-700 delay-100">
            أدخل بيانات الطالب لإنشاء ملف PDF تلقائياً
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-elegant p-8 mb-8 border border-border/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          {!pdfUrl ? (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                  <p className="text-lg text-muted-foreground">جاري إنشاء ملف PDF...</p>
                  <p className="text-sm text-muted-foreground mt-2">يرجى الانتظار</p>
                </div>
              ) : (
                <StudentForm 
                  onSubmit={(data) => {
                    setIsLoading(true);
                    console.log("Form data:", data);
                    // سيتم إرسال البيانات إلى n8n webhook هنا
                  }}
                  setPdfUrl={setPdfUrl}
                  setIsLoading={setIsLoading}
                />
              )}
            </>
          ) : (
            <DownloadResult 
              pdfUrl={pdfUrl} 
              onReset={() => {
                setPdfUrl("");
                setIsLoading(false);
              }} 
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
          <p>نظام مدعوم بـ Google Sheets و n8n</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
