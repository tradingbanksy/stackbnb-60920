import stackdSeal from '@/assets/stackd-verified-seal.png';

interface StackdVerifiedBadgeProps {
  category: string;
}

const StackdVerifiedBadge = ({ category }: StackdVerifiedBadgeProps) => {
  return (
    <div className="py-8 space-y-3 text-center items-center bg-muted/50 rounded-2xl px-6">
      <img
        src={stackdSeal}
        alt="stackd verified seal"
        className="h-52 w-52 object-contain mx-auto"
      />
      <h2 className="text-[22px] font-semibold">Verified</h2>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Every {category.toLowerCase()} experience on stackd is vetted for quality
        and safety so you can book with confidence.
      </p>
    </div>
  );
};

export default StackdVerifiedBadge;
