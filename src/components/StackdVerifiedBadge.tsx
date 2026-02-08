import stackdSeal from '@/assets/stackd-verified-seal.png';

interface StackdVerifiedBadgeProps {
  category: string;
}

const StackdVerifiedBadge = ({ category }: StackdVerifiedBadgeProps) => {
  return (
    <div className="py-6 space-y-3 text-center items-center">
      <img
        src={stackdSeal}
        alt="stackd verified seal"
        className="h-40 w-40 object-contain mx-auto"
      />
      <h2 className="text-[22px] font-semibold">stackd verified</h2>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Every {category.toLowerCase()} experience on stackd is vetted for quality
        and safety so you can book with confidence.
      </p>
      <button className="text-[15px] font-semibold underline underline-offset-4 hover:text-foreground/80 transition-colors">
        Learn more
      </button>
    </div>
  );
};

export default StackdVerifiedBadge;
