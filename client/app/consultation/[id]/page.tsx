import { VideoConsultationUI } from '@/components/VideoConsultationUI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default async function ConsultationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const consultationId = params.id;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Secure Telehealth Consultation
        </h1>
        <div className="flex items-center text-sm text-emerald-600 font-medium bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 mr-2" />
          End-to-End Encrypted (WebRTC)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <VideoConsultationUI 
            consultationId={consultationId}
            // In a real app, these would be fetched from auth context
            userId="demo-user-id"
            userName="Demo User"
            role="patient" 
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Details</CardTitle>
              <CardDescription>Session ID: {consultationId.substring(0, 8)}...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                <strong>Security Protocol:</strong> Your connection is peer-to-peer. Audio and video data is encrypted using DTLS-SRTP directly between you and the doctor. It is never routed through our servers.
              </p>
              <p>
                <strong>Network Check:</strong> If you experience lag, please ensure you have a stable broadband connection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Notes</CardTitle>
              <CardDescription>Private notes taken during the call.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full h-48 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your notes here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
