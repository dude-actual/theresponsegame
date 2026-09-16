window.TRG = window.TRG || {};
(() => {
'use strict';
class AudioDirector {
  constructor(key='trgAudioV13'){this.key=key;this.ctx=null;this.enabled=localStorage.getItem(key)!=='off';this.master=.035;}
  ensure(){if(!this.enabled)return null;if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;this.ctx=new AC();}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return this.ctx;}
  setEnabled(v){this.enabled=!!v;localStorage.setItem(this.key,this.enabled?'on':'off');if(this.enabled)this.ensure();return this.enabled;}
  toggle(){return this.setEnabled(!this.enabled);}
  osc(freq,dur=.06,type='sine',delay=0,gain=1){const c=this.ensure();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(this.master*gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.01);}
  noise(dur=.05,delay=0,gain=.35){const c=this.ensure();if(!c)return;const len=Math.max(1,Math.floor(c.sampleRate*dur)),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=c.createBufferSource(),g=c.createGain(),t=c.currentTime+delay;s.buffer=b;g.gain.setValueAtTime(this.master*gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(g);g.connect(c.destination);s.start(t);s.stop(t+dur+.01);}
  cue(name){if(!this.enabled)return;switch(name){case 'tap':this.osc(520,.035,'triangle',0,.35);break;case 'select':this.osc(420,.045,'sine',0,.45);this.osc(620,.05,'sine',.04,.35);break;case 'accepted':this.osc(440,.07,'sine',0,.6);this.osc(660,.08,'sine',.06,.55);break;case 'deploy':this.osc(260,.08,'triangle',0,.55);this.osc(390,.09,'triangle',.07,.55);this.osc(585,.12,'sine',.14,.65);break;case 'alert':this.noise(.035,0,.4);this.osc(210,.09,'square',0,.35);this.osc(210,.09,'square',.14,.28);break;case 'period':this.osc(330,.08,'sine',0,.5);this.osc(495,.09,'sine',.07,.5);this.osc(660,.13,'sine',.15,.6);break;case 'achievement':this.osc(392,.09,'sine',0,.55);this.osc(523,.09,'sine',.08,.55);this.osc(659,.16,'sine',.16,.7);break;case 'error':this.osc(180,.11,'sawtooth',0,.35);this.osc(145,.13,'sawtooth',.09,.28);break;default:this.osc(500,.04,'sine',0,.3);}}
}
window.TRG.AudioDirector=AudioDirector;
})();