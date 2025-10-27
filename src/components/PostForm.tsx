import React,{useMemo,useState} from "react";
import type { City } from "../types";
type Cat="home"|"job"|"sell"|"buy"|"service"|"study";
const L:Record<Cat,string>={home:"住まい",job:"求人",sell:"売ります",buy:"買います",service:"サービス",study:"留学"};
export default function PostForm({open,onClose,onSubmit,city}:{open:boolean;onClose:()=>void;onSubmit:(p:any)=>void;city:City;}){
  const[c,setC]=useState<Cat>("sell");const[t,setT]=useState("");const[b,setB]=useState("");const[pz,setP]=useState("");const[img,setImg]=useState(0);const[f,setF]=useState(false);
  const errs=useMemo(()=>{const e:string[]=[];if(!t.trim())e.push("タイトルは必須");if(!b.trim())e.push("本文は必須");if(c==="sell"&&img<1)e.push("売ります は写真が必須");if(c==="home"&&img<1&&!f)e.push("住まい は写真または間取りが必須");return e},[t,b,c,img,f]);
  const submit=()=>{ if(errs.length) return; onSubmit({city,category:c,title:t,body:b,price:pz,images:img,hasFloorplan:f})};
  if(!open) return null;
  return(<div className="fixed inset-0 z-[85] bg-black/40 pt-16" onClick={onClose}>
    <div className="mx-auto w-full max-w-xl max-h-[80vh] overflow-auto bg-white rounded-3xl p-5 shadow" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">新規投稿</h2><button onClick={onClose} className="text-sm text-gray-500">×</button></div>
      <div className="mt-3 grid gap-3">
        <div className="flex flex-wrap gap-2">{(["sell","buy","home","job","service","study"] as Cat[]).map(x=>(<button key={x} onClick={()=>setC(x)} className={`px-3 py-1.5 rounded-full text-xs border ${c===x?"bg-black text-white":"bg-white"}`}>{L[x]}</button>))}</div>
        <input value={t} onChange={e=>setT(e.target.value)} placeholder="タイトル" className="w-full border rounded-xl px-3 py-2 text-sm"/>
        <textarea value={b} onChange={e=>setB(e.target.value)} placeholder="本文（受け渡し場所や条件など）" className="w-full border rounded-xl px-3 py-2 text-sm h-28"/>
        <div className="flex gap-3">
          <input value={pz} onChange={e=>setP(e.target.value)} placeholder="価格（$20 / $2000/mo / Ask）" className="flex-1 border rounded-xl px-3 py-2 text-sm"/>
          <label className="flex items-center gap-2 text-sm"><span className="text-xs text-gray-600">画像枚数</span>
            <input type="number" min={0} value={img} onChange={e=>setImg(parseInt(e.target.value||"0",10))} className="w-20 border rounded-xl px-2 py-2 text-sm text-right"/></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f} onChange={e=>setF(e.target.checked)}/>間取り（住まいの場合、写真の代わりに可）</label>
        <div className="flex justify-end gap-2 pt-1"><button onClick={onClose} className="px-4 py-2 text-sm rounded-full border">キャンセル</button><button onClick={submit} className="px-5 py-2 text-sm rounded-full text-white bg-blue-600">下書き保存（ダミー）</button></div>
        <p className="text-[11px] text-gray-500">ルール: 売=写真必須／住=写真または間取り必須。他は任意。</p>
      </div>
    </div>
  </div>);
}
