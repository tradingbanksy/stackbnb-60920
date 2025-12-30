import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Store, CreditCard, Receipt, UserPen, Lock, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HostBottomNav from "@/components/HostBottomNav";
import { useSignup } from "@/contexts/SignupContext";

const HostProfile = () => {
  const navigate = useNavigate();
  const { hostSignupData, propertyData } = useSignup();

  const firstName = hostSignupData.firstName || "John";
  const lastName = hostSignupData.lastName || "Doe";
  const propertyName = propertyData.propertyName || "Beach House Paradise";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const menuItems = [
    { 
      label: "Your Storefront Link", 
      icon: Store, 
      action: "/host/storefront",
      gradient: false
    },
    { 
      label: "Payment Settings", 
      icon: CreditCard, 
      action: "/host/payment-settings",
      gradient: false
    },
    { 
      label: "Payout History", 
      icon: Receipt, 
      action: "/host/payout-history",
      gradient: false
    },
    { 
      label: "Edit Profile", 
      icon: UserPen, 
      action: "/host/edit-profile",
      gradient: false
    },
    { 
      label: "Change Password", 
      icon: Lock, 
      action: "/host/change-password",
      gradient: false
    },
    { 
      label: "Help & Support", 
      icon: HelpCircle, 
      action: "/host/help-support",
      gradient: false
    },
    { 
      label: "Log Out", 
      icon: LogOut, 
      action: "/signout",
      gradient: true
    },
  ];

  const handleMenuClick = (action: string) => {
    navigate(action);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
          <button
            onClick={() => navigate('/signout')}
            className="p-2 rounded-lg hover:bg-muted transition-colors active:scale-95"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Profile Header Card */}
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 bg-gradient-to-r from-orange-500 to-pink-500 flex-shrink-0">
              <AvatarFallback className="text-white text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold truncate">{firstName} {lastName}</h2>
              <p className="text-sm text-muted-foreground truncate">{propertyName}</p>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.action)}
              className={`
                w-full flex items-center justify-between p-4 
                hover:bg-muted/30 active:bg-muted/50 transition-all
                ${index !== menuItems.length - 1 ? 'border-b' : ''}
                ${item.gradient ? 'bg-gradient-to-r from-orange-500/5 to-pink-500/5' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 flex-shrink-0 ${item.gradient ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium text-sm ${item.gradient ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </Card>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default HostProfile;
