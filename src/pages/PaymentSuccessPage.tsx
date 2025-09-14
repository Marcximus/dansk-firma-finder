import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Betaling gennemført!</CardTitle>
            <CardDescription>
              Din betaling er blevet behandlet og dine rapporter er nu blevet bestilt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Hvad sker der nu?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Dine rapporter bliver genereret automatisk</li>
                <li>• Du vil modtage en bekræftelsesmail med ordredetaljer</li>
                <li>• Rapporterne vil være klar inden for 24 timer</li>
                <li>• Du vil få besked når de er klar til download</li>
              </ul>
            </div>

            {sessionId && (
              <div className="text-sm text-muted-foreground">
                <p>Reference: {sessionId.substring(0, 20)}...</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/virksomhedsrapporter')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Bestil flere rapporter
              </Button>
              <Button onClick={() => navigate('/')}>
                Tilbage til forsiden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;