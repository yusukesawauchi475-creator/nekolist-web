import {useState} from "react";
import { supabase, hasSupabase } from "../lib/supabase";
export default function AuthMock({open,onClose,onAuthed}:{open:boolean;onClose:()=>void;onAuthed:(e:string)=>void;}){
  const [email,setEmail]=useState("");
  if(!open) return null;
  const go=async()=>{
    if(!email.includes("@")) return alert("メールを入力");
    if(hasSupabase && supabase){
      try{
        await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin } });
      }catch{}
    }
    localStorage.setItem("nl_user",email);
    onAuthed(email);
  };
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 pt-16" onClick={onClose}>
      <div className="mx-auto w-full max-w-sm bg-white rounded-3xl p-5 shadow" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">ログイン（メール）</h2>
          <button onClick={onClose} className="text-sm text-gray-500">×</button>
        </div>
        <p className="mt-2 text-sm text-gray-600">投稿/DMはログインが必要です。</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded-xl px-3 py-2 text-sm mt-3"/>
        <button onClick={go} className="mt-3 w-full px-4 py-2 rounded-full text-white bg-blue-600">メールで続行</button>
      </div>
    </div>
  );
}
