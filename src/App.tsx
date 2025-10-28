import React,{useEffect,useMemo,useState} from "react";
import PostForm from "./components/PostForm";
import AuthMock from "./components/AuthMock";
import DMToast from "./components/DMToast";
import ReportModal from "./components/ReportModal";
import { Footer } from "./components/Footer";
import { fetchListings } from "./api/listings";
import { startThread } from "./api/messages";
import { reportListing } from "./api/reports";
import type { City, Cat, Listing } from "./types";

const CAT_LABEL:Record<Exclude<Cat,"all">,string>={home:"住まい",job:"求人",sell:"売ります",buy:"買います",service:"サービス",study:"留学"};

const Chip:React.FC<{c:Exclude<Cat,"all">}>=({c})=>(<span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700">{CAT_LABEL[c]}</span>);
const Card:React.FC<{it:Listing;onContact:()=>void;onReport:()=>void}>=({it,onContact,onReport})=>(
 <div className="bg-white rounded-2xl shadow-sm border p-3 flex gap-3">
  <img src={it.thumb} alt="" className="w-28 h-28 rounded-xl object-cover"/>
  <div className="flex-1 flex flex-col min-w-0">
   <div className="flex items-center gap-2 mb-1"><Chip c={it.cat}/><span className="text-xs text-gray-500">{it.area}</span></div>
   <h3 className="text-sm font-semibold truncate">{it.title}</h3>
   <p className="text-xs text-gray-600 line-clamp-2">{it.excerpt}</p>
   <div className="mt-auto flex items-center justify-between">
    <span className="text-lg font-bold text-gray-800">{it.price}</span>
    <div className="flex gap-2">
     <button onClick={onContact} className="px-4 py-1.5 rounded-full text-sm text-white bg-blue-600">連絡する</button>
     <button onClick={onReport} className="text-xs text-gray-500">通報</button>
     <button className="text-gray-400">⋮</button>
    </div>
   </div>
  </div>
 </div>
);

export default function App(){
 const [city,setCity]=useState<City>("nyc");
 const [cat,setCat]=useState<Cat|"all">("all");
 const [items,setItems]=useState<Listing[]>([]);
 const [postOpen,setPostOpen]=useState(false);
 const [authOpen,setAuthOpen]=useState(false);
 const [dmOpen,setDmOpen]=useState(false);
 const [reportOpen,setReportOpen]=useState(false);
 const [reportListingId,setReportListingId]=useState("");
 const [user,setUser]=useState("");
 const [page,setPage]=useState(1);
 const PER_PAGE=20;

 useEffect(()=>{
  const stored=localStorage.getItem("nl_user");
  if(stored)setUser(stored);
 },[]);

 useEffect(()=>{
  fetchListings(city).then(setItems);
  setPage(1);
 },[city]);

 const filtered=useMemo(()=>{
  if(cat==="all")return items;
  return items.filter(it=>it.cat===cat);
 },[items,cat]);

 const totalPages=Math.ceil(filtered.length/PER_PAGE);
 const paged=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);

 const openPost=()=>user?setPostOpen(true):setAuthOpen(true);
 const handleContact=(id:string)=>{
  if(!user){setAuthOpen(true);return;}
  startThread({listing_id:id,from_email:user});
  setDmOpen(true);
  setTimeout(()=>setDmOpen(false),3000);
 };
 const handleReport=(id:string)=>{
  setReportListingId(id);
  setReportOpen(true);
 };
 const submitReport=(reason:string)=>{
  reportListing({listing_id:reportListingId,reporterId:undefined,reason});
  alert("通報しました。24時間以内に対応します。");
 };

 return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
   <header className="sticky top-0 z-50 bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
     <h1 className="text-xl font-bold">Nacho</h1>
     <div className="flex gap-2">
      {(["nyc","la","ldn"] as City[]).map(c=>(
       <button key={c} onClick={()=>setCity(c)} className={`px-4 py-1.5 rounded-full text-sm ${city===c?"bg-black text-white":"bg-gray-100"}`}>{c.toUpperCase()}</button>
      ))}
     </div>
    </div>
   </header>
   <main className="flex-1">
    <div className="max-w-7xl mx-auto px-4 py-4">
     <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-600">ゲスト閲覧 / 都市: {city.toUpperCase()}</p>
      <button onClick={openPost} className="px-5 py-2 rounded-full text-white bg-blue-600 font-semibold">投稿</button>
     </div>
     <div className="flex gap-2 mb-4 overflow-x-auto">
      {["all","home","job","sell","buy","service","study"].map(c=>(
       <button key={c} onClick={()=>{setCat(c as Cat|"all");setPage(1);}} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${cat===c?"bg-black text-white":"bg-white border"}`}>
        {c==="all"?"すべて":CAT_LABEL[c as Exclude<Cat,"all">]}
       </button>
      ))}
     </div>
     <div className="space-y-3">
      {paged.map(it=><Card key={it.id} it={it} onContact={()=>handleContact(it.id)} onReport={()=>handleReport(it.id)}/>)}
     </div>
     {totalPages>1&&(
      <div className="mt-6 flex items-center justify-center gap-4">
       <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-full bg-white border disabled:opacity-50">前へ</button>
       <span className="text-sm text-gray-600">{page}/{totalPages}</span>
       <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-4 py-2 rounded-full bg-white border disabled:opacity-50">次へ</button>
      </div>
     )}
    </div>
   </main>
   <Footer />
   {postOpen&&<PostForm city={city} user={user} onClose={()=>setPostOpen(false)} onSuccess={()=>{setPostOpen(false);fetchListings(city).then(setItems);}}/>}
   {authOpen&&<AuthMock open={authOpen} onClose={()=>setAuthOpen(false)} onAuthed={e=>{setUser(e);setAuthOpen(false);}}/>}
   {dmOpen&&<DMToast/>}
   {reportOpen&&<ReportModal open={reportOpen} onClose={()=>setReportOpen(false)} onSubmit={submitReport}/>}
  </div>
 );
}
