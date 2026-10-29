import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const tools = [
  ['gender','01','Género','Predice a partir de un nombre'],
  ['person','02','Persona','Conoce a alguien al azar'],
  ['universities','03','Universidades','Busca por país en inglés'],
  ['weather','04','Clima en RD','Pronóstico de hoy'],
  ['pokemon','05','Pokémon','Imagen, habilidades y sonido'],
  ['news','06','Noticias','Lo último de WordPress'],
  ['about','07','Acerca de','Datos de contacto'],
];
const endpoints = {
  gender: n => `https://api.genderize.io/?name=${encodeURIComponent(n)}`,
  person: 'https://randomuser.me/api/?results=1',
  university: n => `https://adamix.net/proxy.php?country=${encodeURIComponent(n)}`,
  weather: 'https://api.open-meteo.com/v1/forecast?latitude=18.4861&longitude=-69.9312&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSanto_Domingo&forecast_days=1',
  pokemon: n => `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(n.toLowerCase())}`,
  news: 'https://wordpress.org/news/wp-json/wp/v2/posts?per_page=3&_fields=title,excerpt,link',
};
const plain = html => new DOMParser().parseFromString(html || '', 'text/html').body.textContent.trim();
const condition = code => code===0?'Despejado':[1,2,3].includes(code)?'Parcialmente nublado':[45,48].includes(code)?'Niebla':[51,53,55,56,57].includes(code)?'Llovizna':[61,63,65,66,67,80,81,82].includes(code)?'Lluvia':[95,96,99].includes(code)?'Tormenta':'Condiciones variables';
function useRequest() {
  const [state,setState]=useState({data:null,loading:false,error:''});
  const current=useRef(0);
  useEffect(()=>()=>{current.current++},[]);
  async function run(url) {
    const id=++current.current; setState({data:null,loading:true,error:''});
    try { const response=await fetch(url,{headers:{Accept:'application/json'}}); if(!response.ok) throw new Error(response.status===404?'No se encontró el resultado.':'El servicio no está disponible.'); const data=await response.json(); if(id===current.current)setState({data,loading:false,error:''}); }
    catch(e){if(id===current.current)setState({data:null,loading:false,error:e.message==='Failed to fetch'?'No se pudo conectar. Revisa tu internet.':e.message})}
  }
  return [state,run];
}
function Status({state}) { return <>{state.loading&&<p className="notice" role="status">Consultando…</p>}{state.error&&<p className="notice error" role="alert">{state.error}</p>}</>; }
function Form({placeholder,button='Buscar',onSearch}) { const [value,setValue]=useState(''); return <form onSubmit={e=>{e.preventDefault(); if(value.trim())onSearch(value.trim())}}><label className="sr-only" htmlFor="search">{placeholder}</label><input id="search" value={value} onChange={e=>setValue(e.target.value)} placeholder={placeholder} required /><button>{button}</button></form> }
function Gender() { const [s,run]=useRequest(); const d=s.data; return <><p>Consulta la estimación estadística de Genderize a partir de un nombre.</p><Form placeholder="Ejemplo: Irma" onSearch={n=>run(endpoints.gender(n))}/><Status state={s}/>{d&&(d.gender ? <div className={`result ${d.gender==='male'?'blue':'pink'}`}><span>RESULTADO PARA {d.name}</span><h2>{d.gender==='male'?'Masculino':'Femenino'}</h2><p>Probabilidad estimada: {Math.round((d.probability || 0)*100)} %</p></div>:<p className="notice">No hay una predicción disponible para este nombre.</p>)}</> }
function Person() { const [s,run]=useRequest(); useEffect(()=>{run(endpoints.person)},[]); const d=s.data?.results?.[0]; return <><p>Una persona distinta cada vez que pulsas el botón.</p><button onClick={()=>run(endpoints.person)}>Generar otra persona</button><Status state={s}/>{d&&<div className="result profile"><img src={d.picture.large} alt={`Foto de ${d.name.first}`} /><div><span>PERSONA ALEATORIA</span><h2>{d.name.first} {d.name.last}</h2><p>Nacimiento: {d.dob.date.slice(0,10)}</p><p>Edad: {d.dob.age} años</p></div></div>}</> }
function Universities() { const [s,run]=useRequest(); return <><p>Escribe el país en inglés, por ejemplo <strong>Dominican Republic</strong>.</p><Form placeholder="País en inglés" onSearch={n=>run(endpoints.university(n))}/><Status state={s}/>{Array.isArray(s.data)&&<div className="list">{s.data.length===0?<p>No se encontraron universidades.</p>:<p>{s.data.length} universidades encontradas</p>}{s.data.map((u,i)=><article className="item" key={`${u.name}-${i}`}><h3>{u.name}</h3><p>Dominio: {u.domains?.[0] || 'No disponible'}</p>{u.web_pages?.[0]&&<a href={u.web_pages[0]} target="_blank" rel="noreferrer">Visitar página ↗</a>}</article>)}</div>}</> }
function Weather() { const [s,run]=useRequest();useEffect(()=>{run(endpoints.weather)},[]);const d=s.data?.daily;return <><p>Pronóstico de hoy en Santo Domingo, República Dominicana.</p><button onClick={()=>run(endpoints.weather)}>Actualizar clima</button><Status state={s}/>{d&&<div className="result weather"><span>{d.time[0]} · SANTO DOMINGO</span><h2>{condition(d.weather_code[0])}</h2><div className="temperatures"><strong>{d.temperature_2m_max[0]}°</strong><div>Máxima<br/>Mínima: {d.temperature_2m_min[0]}°C</div></div><p>Probabilidad de lluvia: {d.precipitation_probability_max[0] ?? 'No disponible'} %</p><small>Fuente: Open-Meteo</small></div>}</> }
function Pokemon(){const [s,run]=useRequest();const sound=useRef(null);const [soundError,setSoundError]=useState('');useEffect(()=>()=>{sound.current?.pause()},[]); const d=s.data; async function play(){try{sound.current?.pause();sound.current=new Audio(d.cries.latest);await sound.current.play();setSoundError('')}catch{setSoundError('No se pudo reproducir el sonido.')}}return <><p>Busca por nombre o número, por ejemplo pikachu.</p><Form placeholder="Nombre del Pokémon" onSearch={n=>{sound.current?.pause();setSoundError('');run(endpoints.pokemon(n))}}/><Status state={s}/>{d&&<div className="result poke"><div><span>POKÉMON #{d.id}</span><h2 className="capitalize">{d.name}</h2><p>Experiencia base: <strong>{d.base_experience}</strong></p><p>Habilidades: {d.abilities.map(a=>a.ability.name).join(', ')}</p>{d.cries?.latest?<button onClick={play}>▶ Reproducir sonido</button>:<p>Sonido no disponible.</p>}{soundError&&<p className="error">{soundError}</p>}</div>{d.sprites?.front_default&&<img src={d.sprites.front_default} alt={d.name}/>}</div>}</>}
function News(){const [s,run]=useRequest();useEffect(()=>{run(endpoints.news)},[]);return <><img className="wp-logo" src="/assets/wordpress.png" alt="Logo de WordPress"/><p>Últimas tres noticias de WordPress.org.</p><button onClick={()=>run(endpoints.news)}>Actualizar noticias</button><Status state={s}/>{Array.isArray(s.data)&&<div className="list">{s.data.map((p,i)=><article className="item" key={p.link||i}><h3>{plain(p.title?.rendered)}</h3><p>{plain(p.excerpt?.rendered)}</p><a href={p.link} target="_blank" rel="noreferrer">Visitar noticia original ↗</a></article>)}</div>}</>}
function About(){return <div className="result profile about"><img src="/assets/paul.png" alt="Foto de Paul Sanchez Matos"/><div><span>ESTUDIANTE ITLA</span><h2>Paul Sanchez Matos</h2><p>Matrícula: 20251200</p><p>Correo: 20251200@itla.edu.do</p><a href="mailto:20251200@itla.edu.do">Enviar correo ↗</a><p className="credit">Foto de portada: <a href="https://commons.wikimedia.org/wiki/File:20060513_toolbox.jpg" target="_blank" rel="noreferrer">Per Erik Strandberg / Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/2.5/" target="_blank" rel="noreferrer">CC BY-SA 2.5</a>.</p></div></div>}
const views={gender:Gender,person:Person,universities:Universities,weather:Weather,pokemon:Pokemon,news:News,about:About};
function App(){const [page,setPage]=useState('home');useEffect(()=>{function back(e){if(e.key==='Escape'&&page!=='home')setPage('home')}window.addEventListener('keydown',back);return()=>window.removeEventListener('keydown',back)},[page]);const View=views[page];const title=tools.find(t=>t[0]===page)?.[2];return <div className="app"><header><div className="brand"><b>✦</b><span>KIT DE PAUL<small>HERRAMIENTAS EN UN SOLO LUGAR</small></span></div>{page!=='home'&&<button className="back" onClick={()=>setPage('home')}>← Inicio</button>}</header>{page==='home'?<main><div className="hero"><div><span>HOLA, SOY PAUL</span><h1>Una caja para<br/>descubrir más.</h1><p>Información útil y curiosidades en un solo lugar.</p></div><img src="/assets/toolbox.jpg" alt="Caja de herramientas abierta"/></div><div className="section-title"><h2>Explora las herramientas</h2><p>Selecciona una opción para comenzar.</p></div><div className="grid">{tools.map(([id,num,name,description])=><button className="tool" key={id} onClick={()=>setPage(id)}><span>{num}</span><div><strong>{name}</strong><small>{description}</small></div><b>↗</b></button>)}</div></main>:<main><div className="page-title"><span>HERRAMIENTA / {tools.find(t=>t[0]===page)?.[1]}</span><h1>{title}</h1></div><section className="panel"><View key={page}/></section></main>}<footer>Paul Sanchez Matos · ITLA · 20251200</footer></div>}
createRoot(document.getElementById('root')).render(<App/>);
