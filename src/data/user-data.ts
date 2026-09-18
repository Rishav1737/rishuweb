export interface UserData {
  id: string;
  name: string;
  avatar: string;
  message: string;
  role: string;
  vimeoId?: string;
}

// Example testimonial data — replace with your own clients, photos, and Vimeo IDs.
export const userData: UserData[] = [
  {
    id: "fundgamer",
    name: "FundGamer",
    avatar: "/testimonials/placeholder-1.png",
    message: "Good editor , got the exact thing needed with cool effects, will hire him for more projects!",
    role: "Content Creator",
    vimeoId: "000000000"
  },
  {
    id: "frsidesky",
    name: "FrSideSky",
    avatar: "/testimonials/placeholder-2.png",
    message: "Cool Edits made by him! Will hire for more upcoming projects!.",
    role: "Content Creator",
    vimeoId: "000000000"
  },
  {
    id: "zenoxofficial",
    name: "ZenoxOfficial",
    avatar: "/testimonials/placeholder-3.png",
    message: "Good Pal! Creates awesome videos.",
    role: "Co-Editor",
    vimeoId: "000000000"
  },
  {
    id: "squaremedia",
    name: "SquareMedia",
    avatar: "/testimonials/placeholder-4.png",
    message: "Best Motion Graphics Editor! Creates good Thumbnails!",
    role: "Design Studio Owner",
    vimeoId: "000000000"
  },
  {
    id: "sixzigaming",
    name: "SixziGaming",
    avatar: "/testimonials/placeholder-5.png",
    message: "My Professional Editor. Good Edits by Him!",
    role: "Content Creator",
    vimeoId: "000000000"
  }
];
