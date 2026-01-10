import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Users, Mail, CalendarPlus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingData, guestData } = useBooking();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#f97316', '#ec4899', '#22c55e', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Delay content animation
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const formatDateForCalendar = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours || 9, minutes || 0, 0, 0);
    return date;
  };

  const generateGoogleCalendarUrl = () => {
    const startDate = formatDateForCalendar(bookingData.date, bookingData.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatDate = (date: Date) => 
      date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: bookingData.experienceName,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Booking with ${bookingData.vendorName}\nGuests: ${bookingData.guests}\nTotal: $${bookingData.totalPrice}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateICSContent = () => {
    const startDate = formatDateForCalendar(bookingData.date, bookingData.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date: Date) => 
      date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Stackd//Booking//EN
BEGIN:VEVENT
UID:${Date.now()}@stackd.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${bookingData.experienceName}
DESCRIPTION:Booking with ${bookingData.vendorName}\\nGuests: ${bookingData.guests}\\nTotal: $${bookingData.totalPrice}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bookingData.experienceName.replace(/\s+/g, '-')}-booking.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(), '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-[375px] mx-auto">
        {/* Progress Indicator */}
        <div className="bg-card border-b p-4">
          <div className="text-center text-sm text-muted-foreground mb-2">Step 3 of 3</div>
          <div className="flex gap-1">
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
          </div>
        </div>

        <div className={`px-4 py-8 space-y-6 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Success Icon */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-scale-in">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold animate-fade-in">Booking Confirmed!</h1>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
                Your experience has been successfully booked
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <Card className="p-5 space-y-4">
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">{bookingData.experienceName}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">{bookingData.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{bookingData.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-muted-foreground">{bookingData.guests} {bookingData.guests === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Paid</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    ${bookingData.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor Info */}
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Vendor Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{bookingData.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">Available in confirmation email</span>
              </div>
            </div>
          </Card>

          {/* Email Confirmation */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Email Confirmation Sent</p>
                <p className="text-xs text-muted-foreground">
                  A confirmation email with all booking details has been sent to <span className="font-medium">{guestData.email}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Add to Calendar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                size="lg"
              >
                <CalendarPlus className="h-5 w-5" />
                Add to Calendar
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-[343px]">
              <DropdownMenuItem onClick={openGoogleCalendar} className="cursor-pointer">
                <span className="mr-2">📅</span>
                Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadICS} className="cursor-pointer">
                <span className="mr-2">🍎</span>
                Apple Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadICS} className="cursor-pointer">
                <span className="mr-2">📧</span>
                Outlook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              variant="gradient" 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/explore')}
            >
              Back to Experiences
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/explore')}
            >
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
