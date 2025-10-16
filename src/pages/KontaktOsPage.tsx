import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';
import JSONLDScript, { createOrganizationSchema } from '@/components/JSONLDScript';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Navn skal være mindst 2 tegn').max(100, 'Navn må ikke overstige 100 tegn'),
  email: z.string().trim().email('Ugyldig email adresse').max(255, 'Email må ikke overstige 255 tegn'),
  phone: z.string().regex(/^(\+?45\s?)?[0-9\s-]{8,20}$/, 'Ugyldigt telefonnummer').optional().or(z.literal('')),
  company: z.string().max(200, 'Virksomhedsnavn må ikke overstige 200 tegn').optional().or(z.literal('')),
  subject: z.string().trim().min(5, 'Emne skal være mindst 5 tegn').max(200, 'Emne må ikke overstige 200 tegn'),
  message: z.string().trim().min(10, 'Besked skal være mindst 10 tegn').max(2000, 'Besked må ikke overstige 2000 tegn'),
  contactType: z.enum(['general', 'technical', 'billing', 'partnership', 'legal', 'accounting']),
  preferredContact: z.enum(['email', 'phone', 'either']),
  wantNewsletter: z.boolean(),
});

const KontaktOsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    contactType: 'general',
    preferredContact: 'email',
    wantNewsletter: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validationResult = contactSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(', ');
        alert(`Venligst ret følgende fejl: ${errors}`);
        return;
      }

      // Check if this is a service request (lead)
      if (formData.contactType === 'legal' || formData.contactType === 'accounting') {
        // Submit as lead
        const response = await fetch(`https://yvpsrnjyldlyqomlonop.supabase.co/functions/v1/handle-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cHNybmp5bGRseXFvbWxvbm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjM0MDksImV4cCI6MjA2NTczOTQwOX0.7ZS-k5208kt62atnewZIzAOZl8bOxtCZP3xRh_MjLag`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            service_type: formData.contactType,
            message: `${formData.subject}\n\n${formData.message}`,
          }),
        });

        if (response.ok) {
          alert('Tak for din forespørgsel! Vi har modtaget din anmodning om hjælp og vil kontakte dig snarest.');
        } else {
          throw new Error('Failed to submit lead');
        }
      } else {
        // Regular contact form submission (no backend processing yet)
        alert('Tak for din henvendelse! Vi kontakter dig snarest muligt.');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        contactType: 'general',
        preferredContact: 'email',
        wantNewsletter: false,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Der opstod en fejl. Prøv venligst igen.');
    }
  };

  return (
    <Layout>
      <SEO 
        title="Kontakt Os - Få hjælp og support | SelskabsInfo"
        description="Kontakt SelskabsInfo for support, spørgsmål eller hjælp. Vi er klar til at hjælpe dig."
        canonicalUrl="https://selskabsinfo.dk/kontakt-os"
        keywords="kontakt, support, hjælp, kundeservice"
      />
      <JSONLDScript data={createOrganizationSchema()} />
      <div className="py-8 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Kontakt Os</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Vi er her for at hjælpe dig. Kontakt os på den måde, der passer dig bedst.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send os en besked</CardTitle>
                <CardDescription>
                  Udfyld formularen nedenfor, så vender vi tilbage til dig så hurtigt som muligt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Contact Type */}
                  <div className="space-y-3">
                    <Label>Hvad drejer din henvendelse sig om?</Label>
                    <RadioGroup
                      value={formData.contactType}
                      onValueChange={(value) => handleInputChange('contactType', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">Generelle spørgsmål</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="technical" id="technical" />
                        <Label htmlFor="technical">Teknisk support</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="billing" id="billing" />
                        <Label htmlFor="billing">Fakturering og abonnement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partnership" id="partnership" />
                        <Label htmlFor="partnership">Partnerskab og samarbejde</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="legal" id="legal" />
                        <Label htmlFor="legal">Hjælp til Jura</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="accounting" id="accounting" />
                        <Label htmlFor="accounting">Hjælp til Regnskab</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Fulde navn *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefonnummer</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Virksomhed</Label>
                      <Input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Emne *</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Din besked *</Label>
                    <Textarea
                      id="message"
                      placeholder="Beskriv dit spørgsmål eller din henvendelse i detaljer..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={5}
                    />
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="space-y-3">
                    <Label>Hvordan vil du helst kontaktes?</Label>
                    <RadioGroup
                      value={formData.preferredContact}
                      onValueChange={(value) => handleInputChange('preferredContact', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="contact-email" />
                        <Label htmlFor="contact-email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="contact-phone" />
                        <Label htmlFor="contact-phone">Telefon</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="either" id="contact-either" />
                        <Label htmlFor="contact-either">Både email og telefon</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.wantNewsletter}
                      onCheckedChange={(checked) => handleInputChange('wantNewsletter', checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Jeg vil gerne modtage nyhedsbreve og opdateringer om Selskabsinfo
                    </Label>
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send besked
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Direct Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Direkte kontakt</CardTitle>
                <CardDescription>
                  Kontakt os direkte via telefon eller email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">kontakt@selskabsinfo.dk</div>
                    <div className="text-xs text-green-600 mt-1">Svar inden for 24 timer</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Telefon</div>
                    <div className="text-sm text-muted-foreground">+45 12 34 56 78</div>
                    <div className="text-xs text-green-600 mt-1">Mandag-fredag: 9:00-17:00</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Building className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium">CVR-nummer</div>
                    <div className="text-sm text-muted-foreground">12345678</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vores kontor</CardTitle>
                <CardDescription>
                  Besøg os på vores kontor i København
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Adresse</div>
                    <div className="text-sm text-muted-foreground">
                      Selskabsinfo ApS<br />
                      Eksempelvej 123, 2. sal<br />
                      1234 København K<br />
                      Danmark
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Åbningstider</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Mandag - Fredag: 9:00 - 17:00</div>
                      <div>Weekend: Lukket</div>
                      <div className="text-xs text-orange-600">Besøg efter aftale</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Support tider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Email support</span>
                    <span className="text-sm text-green-600">24/7</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Telefon support</span>
                    <span className="text-sm text-green-600">9:00-17:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Live chat</span>
                    <span className="text-sm text-green-600">9:00-17:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Akut support</span>
                    <span className="text-sm text-orange-600">På anmodning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Skal du bruge hjælp med noget specifikt?</h3>
          <p className="text-muted-foreground mb-4">
            Mange spørgsmål er allerede besvaret i vores hjælpecenter og FAQ
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <a href="/hjaelpecenter">Besøg hjælpecenter</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/faq">Se ofte stillede spørgsmål</a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KontaktOsPage;