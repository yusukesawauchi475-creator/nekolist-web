import React, { useMemo, useState } from "react";

export type JobItem = {
  id:string; title:string; price:string; area:string; thumb:string; excerpt?:string;
  date?:string; time?:string; requires?:string; // 簡易タグ
};

function DayChips({onPick}:{onPick:(d:string|null)=>void}){
  const days = useMemo(()=>{
    const arr:string[]=[]; const now=new Date();
    for(let i=0;i<7;i++){ const d=new Date(now); d.setDate(now.getDate()+i);
      const label = `${d.getMonth()+1}/${d.getDate()}`;
      arr.push(label);
    } return arr;
  },[]);
  const [sel,setSel]=useState<string|null>(null);
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button onClick={()=>{setSel(null); onPick(null);}} className={`btn ${sel===null?"bg-black text-white":"btn-ghost"}`}>今日</button>
      {days.map(d=>(
        <button key={d} onClick={()=>{setSel(d); onPick(d);}} className={`btn ${sel===d?"bg-black text-white":"btn-ghost"}`}>{d}</button>
      ))}
    </div>
  );
}

function JobCard({it,onContact}:{it:JobItem;onContact:()=>void}){
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <img src={it.thumb} alt="" className="w-full h-28 object-cover"/>
      <div className="p-3">
        <div className="text-sm font-semibold line-clamp-2">{it.title}</div>
        <div className="mt-1 text-xs text-gray-600 line-clamp-1">{it.excerpt||it.area}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-semibold">{it.price}</div>
          <button className="btn btn-primary" onClick={onContact}>連絡する</button>
        </div>
        <div className="mt-2 flex gap-2 text-[11px] text-gray-600">
          {it.time ? <span>🕒 {it.time}</span> : null}
          {it.area ? <span>📍 {it.area}</span> : null}
          {it.requires ? <span className="chip">{it.requires}</span> : null}
        </div>
      </div>
    </div>
  );
}

export default function JobTimee({items,onContact}:{items:JobItem[];onContact:(id:string)=>void}){
  const [picked,setPicked]=useState<string|null>(null);
  const list = useMemo(()=> picked? items.filter(x=>x.date===picked) : items,[picked,items]);
  return (
    <div className="grid gap-3">
      <DayChips onPick={setPicked}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(it=>(
          <JobCard key={it.id} it={it} onContact={()=>onContact(it.id)}/>
        ))}
      </div>
    </div>
  );
}
