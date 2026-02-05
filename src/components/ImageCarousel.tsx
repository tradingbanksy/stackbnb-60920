 import React, { useRef, useState, useEffect, useCallback } from 'react';
 import { Dialog, DialogContent } from '@/components/ui/dialog';
 import { cn } from '@/lib/utils';
 
 interface ImageCarouselProps {
   images: string[];
   alt?: string;
   aspectRatio?: "4/3" | "16/9" | "1/1";
   showFullScreenOnTap?: boolean;
   className?: string;
 }
 
 const ImageCarousel: React.FC<ImageCarouselProps> = ({
   images,
   alt = "Image",
   aspectRatio = "4/3",
   showFullScreenOnTap = true,
   className
 }) => {
   const scrollContainerRef = useRef<HTMLDivElement>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const [fullScreenOpen, setFullScreenOpen] = useState(false);
   const [fullScreenIndex, setFullScreenIndex] = useState(0);
 
   const aspectRatioClass = {
     "4/3": "aspect-[4/3]",
     "16/9": "aspect-video",
     "1/1": "aspect-square"
   }[aspectRatio];
 
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
       <div className={cn("relative bg-muted", className)}>
         {/* Scrollable container */}
         <div
           ref={scrollContainerRef}
           className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
         >
           {images.map((image, index) => (
             <div
               key={index}
               data-carousel-image
               data-index={index}
               className={cn(
                 "flex-shrink-0 w-full snap-center cursor-pointer",
                 aspectRatioClass
               )}
               onClick={() => handleImageClick(index)}
             >
               <img
                 src={image}
                 alt={`${alt} ${index + 1}`}
                 className="w-full h-full object-cover"
                 loading={index === 0 ? "eager" : "lazy"}
               />
             </div>
           ))}
         </div>
 
         {/* Dot indicators */}
         {images.length > 1 && (
           <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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
                     ? "bg-white w-6"
                     : "bg-white/50 hover:bg-white/70"
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