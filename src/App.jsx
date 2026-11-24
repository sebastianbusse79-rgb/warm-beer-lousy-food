import React, { useMemo, useState } from "react";
import { Plus, MapPin, UserPlus, Check, ArrowRight, Utensils, Users, X, Link as LinkIcon, Instagram, ExternalLink } from "lucide-react";

const seedRestaurants = [
  {id:"r1", name:"A Wolf Will Never Be A Pet", area:"St. Pauli", cuisine:"Wine Bar / Small Plates", sourceUrl:"https://www.instagram.com/a_wolf_will_never_be_a_pet/", sourceType:"instagram", tone:"wolf"},
  {id:"r2", name:"Kiosque", area:"St. Pauli", cuisine:"Wine & Pasta Bar", sourceUrl:"https://www.kiosque.hamburg/", sourceType:"website", tone:"kiosque"},
  {id:"r3", name:"Zum Wattkorn", area:"Langenhorn", cuisine:"North German / Regional", sourceUrl:"https://zumwattkorn.de/", sourceType:"website", tone:"wattkorn"},
  {id:"r4", name:"JING JING", area:"Eimsbüttel", cuisine:"Thai Food & Cocktail Bar", sourceUrl:"https://jing-jing.de/", sourceType:"website", tone:"jing"},
];

const people=[
  {id:"u1",name:"Sebastian",initials:"SB",color:"#17382e"},
  {id:"u2",name:"Anna",initials:"AN",color:"#a7503d"},
  {id:"u3",name:"Max",initials:"MK",color:"#344e6b"}
];

const initialEntries=[
  {userId:"u1",restaurantId:"r1",state:"visited",rating:"again",comment:"Creative food, relaxed room and exactly the kind of wine list I like."},
  {userId:"u1",restaurantId:"r2",state:"bucket",rating:null,comment:""},
  {userId:"u1",restaurantId:"r3",state:"bucket",rating:null,comment:""},
  {userId:"u2",restaurantId:"r4",state:"visited",rating:"again",comment:"Great for drinks and a lively evening."},
  {userId:"u2",restaurantId:"r2",state:"bucket",rating:null,comment:""},
  {userId:"u3",restaurantId:"r3",state:"visited",rating:"nice",comment:"A classic Hamburg address with a regional focus."}
];

const ratingMeta={
  again:{label:"I'd go again",emoji:"♥",className:"again"},
  nice:{label:"Nice to have",emoji:"●",className:"nice"},
  dont:{label:"Not for me",emoji:"×",className:"dont"}
};

export default function App(){
  const [activeUser,setActiveUser]=useState("u1");
  const [view,setView]=useState("bucket");
  const [restaurants,setRestaurants]=useState(seedRestaurants);
  const [entries,setEntries]=useState(initialEntries);
  const [reviewing,setReviewing]=useState(null);
  const [comment,setComment]=useState("");
  const [newUrl,setNewUrl]=useState("");

  const mine=entries.filter(e=>e.userId===activeUser);
  const myIds=new Set(mine.map(e=>e.restaurantId));
  const shown=useMemo(()=>view==="friends"?entries.filter(e=>e.userId!==activeUser):mine.filter(e=>view==="bucket"?e.state==="bucket":e.state==="visited"),[entries,activeUser,view]);
  const restaurant=id=>restaurants.find(r=>r.id===id);
  const person=id=>people.find(p=>p.id===id);

  function addToMine(id){
    if(!myIds.has(id)) setEntries(v=>[...v,{userId:activeUser,restaurantId:id,state:"bucket",rating:null,comment:""}]);
  }

  function addFromUrl(){
    if(!newUrl.trim()) return;
    const isInstagram=newUrl.includes("instagram.com");
    const id=`r${Date.now()}`;
    setRestaurants(v=>[...v,{id,name:isInstagram?"Restaurant from Instagram":"Restaurant from website",area:"Hamburg",cuisine:"Details to import",sourceUrl:newUrl.trim(),sourceType:isInstagram?"instagram":"website",tone:"new"}]);
    setEntries(v=>[...v,{userId:activeUser,restaurantId:id,state:"bucket",rating:null,comment:""}]);
    setNewUrl("");
  }

  function saveReview(rating){
    setEntries(v=>v.map(e=>e.userId===activeUser&&e.restaurantId===reviewing?{...e,state:"visited",rating,comment}:e));
    setReviewing(null); setComment(""); setView("visited");
  }

  return <div className="app">
    <header className="hero">
      <img src="/images/hero.png" alt="Beer, wine and food on a restaurant table" />
      <div className="heroShade" />
      <div className="heroContent">
        <div className="eyebrow">Shared restaurant lists · Hamburg</div>
        <h1>Warm Beer,<br/>Lousy Food</h1>
        <p>Good places. No stars. Save what you want to try and remember what was worth going back to.</p>
      </div>
    </header>

    <main className="container">
      <div className="peopleRow">
        <div className="avatars">{people.map(p=><button key={p.id} onClick={()=>setActiveUser(p.id)} title={p.name} className={activeUser===p.id?"avatar active":"avatar"} style={{background:p.color}}>{p.initials}</button>)}</div>
        <div className="viewing">Viewing as <b>{person(activeUser).name}</b></div>
      </div>

      <nav className="tabs">
        {[["bucket","My bucket list",Utensils],["visited","Been there",Check],["friends","Friends' lists",Users]].map(([id,label,Icon])=><button key={id} onClick={()=>setView(id)} className={view===id?"tab active":"tab"}><Icon size={17}/>{label}</button>)}
      </nav>

      {view==="bucket"&&<section className="addBox">
        <label>Add from a website or Instagram</label>
        <div className="addRow"><div className="urlInput"><LinkIcon size={18}/><input value={newUrl} onChange={e=>setNewUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addFromUrl()} placeholder="Paste restaurant URL or Instagram page…" /></div><button className="primary" onClick={addFromUrl}><Plus size={18}/>Add</button></div>
        <small>Clickdummy: the URL creates a sample card. Automatic data and image import comes later.</small>
      </section>}

      <section className="grid">{shown.map(entry=>{
        const r=restaurant(entry.restaurantId); if(!r)return null;
        const owner=person(entry.userId), meta=entry.rating?ratingMeta[entry.rating]:null;
        return <article className="card" key={`${entry.userId}-${entry.restaurantId}`}>
          <div className={`cardVisual ${r.tone}`}><span>{r.name}</span><a href={r.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open source">{r.sourceType==="instagram"?<Instagram size={19}/>:<ExternalLink size={19}/>}</a></div>
          <div className="cardBody">
            {view==="friends"&&<div className="owner"><span style={{background:owner.color}}>{owner.initials}</span>On {owner.name}'s list</div>}
            <div className="cardHead"><div><h2>{r.name}</h2><p className="meta"><MapPin size={15}/>{r.area} · {r.cuisine}</p></div>{meta&&<span className={`verdict ${meta.className}`}>{meta.emoji} {meta.label}</span>}</div>
            {entry.comment&&<blockquote>“{entry.comment}”</blockquote>}
            <footer><a href={r.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink size={13}/></a>
              {view==="bucket"&&<button onClick={()=>{setReviewing(r.id);setComment("")}}>I've been <ArrowRight size={16}/></button>}
              {view==="friends"&&!myIds.has(r.id)&&<button className="outline" onClick={()=>addToMine(r.id)}><UserPlus size={16}/>Add to my list</button>}
              {view==="friends"&&myIds.has(r.id)&&<span className="onList"><Check size={16}/>On my list</span>}
            </footer>
          </div>
        </article>
      })}</section>
    </main>

    {reviewing&&<div className="modalBackdrop"><div className="modal"><div className="modalHead"><div><div className="eyebrow dark">You've been</div><h2>{restaurant(reviewing)?.name}</h2></div><button className="iconButton" onClick={()=>setReviewing(null)}><X/></button></div><label>One short thought</label><textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={180} rows={3} placeholder="What would you tell a friend?"/><small>{comment.length}/180</small><div className="ratings">{Object.entries(ratingMeta).map(([id,m])=><button key={id} onClick={()=>saveReview(id)} className={m.className}>{m.emoji} {m.label}</button>)}</div></div></div>}
  </div>
}
