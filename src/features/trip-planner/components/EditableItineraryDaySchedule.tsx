import { useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MapPin,
  Clock,
  Utensils,
  Bus,
  Sparkles,
  Coffee,
  GripVertical,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ItineraryDay, ItineraryItem, ItineraryItemCategory } from "../types";

const categoryIcons: Record<ItineraryItemCategory, typeof Utensils> = {
  food: Utensils,
  activity: Sparkles,
  transport: Bus,
  free: Coffee,
};

const categoryColors: Record<ItineraryItemCategory, string> = {
  food: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  activity: "text-primary bg-primary/10 border-primary/20",
  transport: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  free: "text-muted-foreground bg-muted border-border",
};

interface EditableItemProps {
  item: ItineraryItem;
  index: number;
  onUpdate: (updates: Partial<ItineraryItem>) => void;
  onRemove: () => void;
}

function EditableItem({ item, index, onUpdate, onRemove }: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${index}-${item.title}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = categoryIcons[item.category];
  const colorClass = categoryColors[item.category];

  const handleSave = () => {
    onUpdate({ title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditDescription(item.description);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={`p-3 border-border/60 ${isDragging ? "shadow-lg ring-2 ring-primary/20" : ""}`}>
        <div className="flex gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Time & Icon */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{item.time}</span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className="h-8 text-sm"
                  autoFocus
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  className="text-sm min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={handleSave} className="h-7 text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
              >
                <h4 className="font-semibold text-foreground text-sm leading-tight truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.location && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete Button with Confirmation */}
          {!isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove activity?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove "{item.title}" from your itinerary. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface EditableItineraryDayScheduleProps {
  day: ItineraryDay;
  dayIndex: number;
  onUpdateItems: (items: ItineraryItem[]) => void;
  onUpdateItem: (itemIndex: number, updates: Partial<ItineraryItem>) => void;
  onRemoveItem: (itemIndex: number) => void;
}

export function EditableItineraryDaySchedule({
  day,
  dayIndex,
  onUpdateItems,
  onUpdateItem,
  onRemoveItem,
}: EditableItineraryDayScheduleProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formattedDate = (() => {
    try {
      return format(parseISO(day.date), "EEEE, MMMM d");
    } catch {
      return day.date;
    }
  })();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = day.items.findIndex((_, idx) => `${idx}-${day.items[idx].title}` === active.id);
      const newIndex = day.items.findIndex((_, idx) => `${idx}-${day.items[idx].title}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(day.items, oldIndex, newIndex);
        onUpdateItems(newItems);
      }
    }
  };

  // Empty state
  if (!day.items || day.items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{day.title}</h3>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>
        <Card className="p-8 text-center border-dashed border-2 bg-muted/30">
          <Coffee className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No activities for this day</p>
        </Card>
      </div>
    );
  }

  const sortableIds = day.items.map((item, idx) => `${idx}-${item.title}`);

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">{day.title}</h3>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag to reorder • Tap to edit • {day.items.length} {day.items.length === 1 ? "item" : "items"}
      </p>

      {/* Sortable items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {day.items.map((item, index) => (
              <EditableItem
                key={`${index}-${item.title}`}
                item={item}
                index={index}
                onUpdate={(updates) => onUpdateItem(index, updates)}
                onRemove={() => onRemoveItem(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
