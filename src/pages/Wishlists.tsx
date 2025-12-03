import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Heart, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { experiences } from "@/data/mockData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Experience images
import kayakingImg from "@/assets/experiences/kayaking.jpg";
import bikesImg from "@/assets/experiences/bikes.jpg";
import snorkelingImg from "@/assets/experiences/snorkeling.jpg";
import photographyImg from "@/assets/experiences/photography.jpg";
import spaImg from "@/assets/experiences/spa.jpg";
import diningImg from "@/assets/experiences/dining.jpg";
import atvImg from "@/assets/experiences/atv.jpg";
import boatImg from "@/assets/experiences/boat.jpg";
import ziplineImg from "@/assets/experiences/zipline.jpg";
import horsebackImg from "@/assets/experiences/horseback.jpg";
import scubaImg from "@/assets/experiences/scuba.jpg";
import hikingImg from "@/assets/experiences/hiking.jpg";
import parasailingImg from "@/assets/experiences/parasailing.jpg";
import yogaImg from "@/assets/experiences/yoga.jpg";
import fishingImg from "@/assets/experiences/fishing.jpg";
import cookingImg from "@/assets/experiences/cooking.jpg";
import balloonImg from "@/assets/experiences/balloon.jpg";
import wineImg from "@/assets/experiences/wine.jpg";

const getExperienceImage = (experienceId: number) => {
  const imageMap: Record<number, string> = {
    1: kayakingImg, 2: bikesImg, 3: snorkelingImg, 4: photographyImg,
    5: spaImg, 6: diningImg, 7: atvImg, 8: boatImg, 9: ziplineImg,
    10: horsebackImg, 11: scubaImg, 12: hikingImg, 13: parasailingImg,
    14: yogaImg, 15: fishingImg, 16: cookingImg, 17: balloonImg, 18: wineImg,
  };
  return imageMap[experienceId] || kayakingImg;
};

interface Wishlist {
  id: string;
  name: string;
  created_at: string;
  items?: WishlistItem[];
}

interface WishlistItem {
  id: string;
  experience_id: number;
}

const Wishlists = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    fetchWishlists();
  }, [isAuthenticated, navigate]);

  const fetchWishlists = async () => {
    try {
      const { data: wishlistsData, error: wishlistsError } = await supabase
        .from("wishlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (wishlistsError) throw wishlistsError;

      // Fetch items for each wishlist
      const wishlistsWithItems = await Promise.all(
        (wishlistsData || []).map(async (wishlist) => {
          const { data: items } = await supabase
            .from("wishlist_items")
            .select("*")
            .eq("wishlist_id", wishlist.id);
          return { ...wishlist, items: items || [] };
        })
      );

      setWishlists(wishlistsWithItems);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      toast.error("Failed to load wishlists");
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast.error("Please enter a wishlist name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .insert({ name: newWishlistName.trim(), user_id: user?.id })
        .select()
        .single();

      if (error) throw error;

      setWishlists([{ ...data, items: [] }, ...wishlists]);
      setNewWishlistName("");
      setIsCreateOpen(false);
      toast.success("Wishlist created!");
    } catch (error) {
      console.error("Error creating wishlist:", error);
      toast.error("Failed to create wishlist");
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;

      setWishlists(wishlists.filter((w) => w.id !== wishlistId));
      if (selectedWishlist?.id === wishlistId) {
        setSelectedWishlist(null);
      }
      toast.success("Wishlist deleted");
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      toast.error("Failed to delete wishlist");
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      if (selectedWishlist) {
        const updatedItems = selectedWishlist.items?.filter((i) => i.id !== itemId) || [];
        setSelectedWishlist({ ...selectedWishlist, items: updatedItems });
        setWishlists(
          wishlists.map((w) =>
            w.id === selectedWishlist.id ? { ...w, items: updatedItems } : w
          )
        );
      }
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const getWishlistThumbnails = (wishlist: Wishlist) => {
    const items = wishlist.items || [];
    return items.slice(0, 4).map((item) => getExperienceImage(item.experience_id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Detail view for selected wishlist
  if (selectedWishlist) {
    const wishlistExperiences = (selectedWishlist.items || [])
      .map((item) => ({
        ...experiences.find((e) => e.id === item.experience_id),
        itemId: item.id,
      }))
      .filter((e) => e.id);

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedWishlist(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold flex-1">{selectedWishlist.name}</h1>
            <span className="text-muted-foreground text-sm">
              {wishlistExperiences.length} saved
            </span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {wishlistExperiences.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No experiences saved yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
                Explore Experiences
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistExperiences.map((exp) => (
                <Card key={exp.itemId} className="overflow-hidden group">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={getExperienceImage(exp.id!)}
                      alt={exp.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(exp.itemId)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{exp.name}</h3>
                    <p className="text-sm text-muted-foreground">{exp.vendor}</p>
                    <p className="mt-2 font-semibold">${exp.price} <span className="font-normal text-muted-foreground text-sm">per person</span></p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Main wishlists grid
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Wishlists</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new wishlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Name your wishlist"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createWishlist()}
                />
                <Button onClick={createWishlist} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {wishlists.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Create your first wishlist</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite experiences to wishlists
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Wishlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlists.map((wishlist) => {
              const thumbnails = getWishlistThumbnails(wishlist);
              const itemCount = wishlist.items?.length || 0;

              return (
                <Card
                  key={wishlist.id}
                  className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedWishlist(wishlist)}
                >
                  <div className="relative aspect-square">
                    {thumbnails.length === 0 ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Heart className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    ) : thumbnails.length === 1 ? (
                      <img
                        src={thumbnails[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="grid grid-cols-2 h-full">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="relative">
                            {thumbnails[i] ? (
                              <img
                                src={thumbnails[i]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWishlist(wishlist.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{wishlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{itemCount} saved</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlists;
