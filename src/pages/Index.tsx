import { useState, useEffect } from "react";
import { StudentForm } from "@/components/StudentForm";
import { DownloadResult } from "@/components/DownloadResult";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background" dir="rtl">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 pt-4 md:pt-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-3 md:mb-4 animate-in px-4">
            نظام إنشاء خطط الطلاب
          </h1>
          <p className="text-base md:text-xl text-muted-foreground animate-in px-4">
            أدخل بيانات الطالب لإنشاء ملف PDF تلقائياً
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-xl md:rounded-2xl shadow-card md:shadow-elegant p-5 md:p-8 mb-6 md:mb-8 border-2 border-border backdrop-blur-sm animate-in">
          {!pdfUrl ? (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                  <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin mb-4" />
                  <p className="text-base md:text-lg text-muted-foreground">جاري إنشاء ملف PDF...</p>
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
        <footer className="text-center text-xs md:text-sm text-muted-foreground animate-in pb-4">
          <p>نظام مدعوم بـ Google Sheets و n8n</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
