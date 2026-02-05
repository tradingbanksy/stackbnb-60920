 import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
 import { Dialog, DialogContent } from '@/components/ui/dialog';
 import { cn } from '@/lib/utils';
 import { FaUtensils, FaStar, FaCamera, FaGlassCheers, FaLeaf } from 'react-icons/fa';
 
 interface ImageCarouselProps {
   images: string[];
   titles?: string[];
   icons?: ReactNode[];
   alt?: string;
   showFullScreenOnTap?: boolean;
   className?: string;
 }
 
 const defaultIcons = [
   <FaUtensils size={20} className="text-white" />,
   <FaStar size={20} className="text-white" />,
   <FaCamera size={20} className="text-white" />,
   <FaGlassCheers size={20} className="text-white" />,
   <FaLeaf size={20} className="text-white" />,
 ];
 
 const ImageCarousel: React.FC<ImageCarouselProps> = ({
   images,
   titles,
   icons,
   alt = "Image",
   showFullScreenOnTap = true,
   className
 }) => {
   const scrollContainerRef = useRef<HTMLDivElement>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const [fullScreenOpen, setFullScreenOpen] = useState(false);
   const [fullScreenIndex, setFullScreenIndex] = useState(0);
 
   // Track which image is visible using Intersection Observer
   useEffect(() => {
     const container = scrollContainerRef.current;
     if (!container) return;
 
     const imageElements = container.querySelectorAll('[data-carousel-image]');
     
     const observer = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
             const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
             setActiveIndex(index);
           }
         });
       },
       {
         root: container,
         threshold: 0.5,
       }
     );
 
     imageElements.forEach((el) => observer.observe(el));
 
     return () => observer.disconnect();
   }, [images.length]);
 
   const scrollToIndex = useCallback((index: number) => {
     const container = scrollContainerRef.current;
     if (!container) return;
     
     const imageWidth = container.offsetWidth;
     container.scrollTo({
       left: index * imageWidth,
       behavior: 'smooth'
     });
   }, []);
 
   const handleImageClick = (index: number) => {
     if (showFullScreenOnTap) {
       setFullScreenIndex(index);
       setFullScreenOpen(true);
     }
   };
 
   if (images.length === 0) return null;
 
   return (
     <>
       <div className={cn("relative flex flex-col items-center justify-center py-4 bg-background", className)}>
         {/* Scrollable container */}
         <div
           ref={scrollContainerRef}
           className="flex w-full max-w-[450px] h-[280px] mx-auto overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-xl"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
         >
           {images.map((image, index) => (
             <div
               key={index}
               data-carousel-image
               data-index={index}
               className="relative flex-shrink-0 w-full h-full snap-center cursor-pointer"
               onClick={() => handleImageClick(index)}
             >
               <img
                 src={image}
                 alt={`${alt} ${index + 1}`}
                 className="w-full h-full object-cover"
                 loading={index === 0 ? "eager" : "lazy"}
               />
               
               {/* Gradient overlay */}
               <div 
                 className="absolute left-0 right-0 bottom-0 h-[120px] pointer-events-none"
                 style={{
                   background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                 }}
               />
               
               {/* Label with icon and title */}
               <div className="absolute left-0 right-0 bottom-3 flex items-center justify-start h-10 z-10 pointer-events-none px-3 gap-2">
                 <div 
                   className="min-w-[36px] max-w-[36px] h-[36px] flex items-center justify-center rounded-full backdrop-blur-sm shadow-md border border-white/20 flex-shrink-0"
                   style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                 >
                   {icons?.[index] || defaultIcons[index % defaultIcons.length]}
                 </div>
                 <div className="text-white font-semibold text-sm drop-shadow-lg">
                   {titles?.[index] || `Photo ${index + 1}`}
                 </div>
               </div>
             </div>
           ))}
         </div>
 
         {/* Dot indicators */}
         {images.length > 1 && (
           <div className="flex gap-1.5 mt-3">
             {images.map((_, index) => (
               <button
                 key={index}
                 onClick={(e) => {
                   e.stopPropagation();
                   scrollToIndex(index);
                 }}
                 className={cn(
                   "w-2 h-2 rounded-full transition-all duration-300",
                   activeIndex === index
                     ? "bg-primary w-6"
                     : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                 )}
                 aria-label={`Go to image ${index + 1}`}
               />
             ))}
           </div>
         )}
       </div>
 
       {/* Fullscreen Dialog */}
       <Dialog open={fullScreenOpen} onOpenChange={setFullScreenOpen}>
         <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
           <div className="relative w-full h-full flex items-center justify-center">
             <img
               src={images[fullScreenIndex]}
               alt={`${alt} ${fullScreenIndex + 1}`}
               className="max-w-full max-h-[90vh] object-contain"
             />
             
             {/* Navigation for fullscreen */}
             {images.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                 {images.map((_, index) => (
                   <button
                     key={index}
                     onClick={() => setFullScreenIndex(index)}
                     className={cn(
                       "w-2 h-2 rounded-full transition-all duration-300",
                       fullScreenIndex === index
                         ? "bg-white w-6"
                         : "bg-white/50 hover:bg-white/70"
                     )}
                     aria-label={`View image ${index + 1}`}
                   />
                 ))}
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 };
 
 export default ImageCarousel;