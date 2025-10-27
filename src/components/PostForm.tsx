import {useMemo,useState} from "react";
import type { City } from "../types";
type Cat="home"|"job"|"sell"|"buy"|"service"|"study";
const L:Record<Cat,string>={home:"住まい",job:"求人",sell:"売ります",buy:"買います",service:"サービス",study:"留学"};
export default function PostForm({city,user,onClose,onSuccess}:{city:City;user:string;onClose:()=>void;onSuccess:()=>void;}){
 const [cat,setCat]=useState<Cat>("home");
 const [title,setTitle]=useState("");
 const [excerpt,setExcerpt]=useState("");
 const [price,setPrice]=useState("");
 const [area,setArea]=useState("");
 const req=useMemo(()=>{
  const r:string[]=[];
  if(!title)r.push("タイトル");
  if(!excerpt)r.push("説明");
  if(cat==="home"||cat==="sell")if(!price)r.push("価格");
  if(cat==="home")if(!area)r.push("エリア");
  return r;
 },[cat,title,excerpt,price,area]);
 const submit=()=>{
  if(req.length)return alert(req.join(", ")+"を入力してください");
  onSuccess();
 };
 return (
  <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
   <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between mb-4">
     <h2 className="text-lg font-bold">投稿</h2>
     <button onClick={onClose} className="text-2xl text-gray-400">×</button>
    </div>
    <div className="space-y-3">
     <div><label className="block text-sm mb-1">カテゴリ</label>
      <div className="flex gap-2 flex-wrap">
       {(["home","job","sell","buy","service","study"]as Cat[]).map(c=>(<button key={c} onClick={()=>setCat(c)} className={`px-3 py-1 rounded-full text-sm ${cat===c?"bg-black text-white":"bg-gray-100"}`}>{L[c]}</button>))}
      </div>
     </div>
     <div><label className="block text-sm mb-1">タイトル*</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2"/></div>
     <div><label className="block text-sm mb-1">説明*</label><textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full border rounded-xl px-3 py-2 h-24"/></div>
     {(cat==="home"||cat==="sell")&&<div><label className="block text-sm mb-1">価格*</label><input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded-xl px-3 py-2" placeholder="$1,200/mo"/></div>}
     {cat==="home"&&<div><label className="block text-sm mb-1">エリア*</label><input value={area} onChange={e=>setArea(e.target.value)} className="w-full border rounded-xl px-3 py-2" placeholder="Brooklyn"/></div>}
     <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold">投稿する</button>
    </div>
   </div>
  </div>
 );
}
