'use client';
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '@/services/api/user';

const contactInfo = [
  { icon: Mail,   label: 'Email Us',    value: 'support@fixhub.com',        color: '#a855f7' },
  { icon: Phone,  label: 'Call Us',     value: '+1 (800) 123-4567',         color: '#3b82f6' },
  { icon: MapPin, label: 'Head Office', value: '123 Fixer Street, NY 10001', color: '#ec4899' },
];

const fadeUp = {
  hidden:  { opacity:0, y:24 },
  visible: { opacity:1, y:0, transition:{ duration:0.55 } },
};

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await userApi.createContact({
        name: form.name,
        email: form.email,
        subject: form.subject || 'General inquiry',
        message: form.message
      });
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name:'', email:'', subject:'', message:'' });
      setTimeout(() => setSent(false), 4000);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to send message';
      toast.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  };

  return (
    <>
      <Navbar />
      <main style={{ background:'#0B0F1A', minHeight:'100vh', paddingTop:80 }}>

        {/* Page hero */}
        <section style={{ padding:'80px 5% 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-150, left:'50%', transform:'translateX(-50%)', width:600, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', pointerEvents:'none' }} />
          <motion.div initial="hidden" animate="visible" variants={{ visible:{ transition:{ staggerChildren:0.1 } } }} style={{ position:'relative', zIndex:1 }}>
            <motion.div variants={fadeUp} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:50, marginBottom:18 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#60a5fa', letterSpacing:'0.8px', textTransform:'uppercase' }}>Get In Touch</span>
            </motion.div>
            <motion.h1 variants={fadeUp} style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, color:'#fff', marginBottom:14, letterSpacing:-0.5 }}>
              We'd Love to{' '}
              <span style={{ background:'linear-gradient(90deg,#3b82f6,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Hear From You
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize:16, color:'#64748b', maxWidth:480, margin:'0 auto' }}>
              Have a question, feedback, or need support? Drop us a message and our team will respond within 24 hours.
            </motion.p>
          </motion.div>
        </section>

        {/* Contact grid */}
        <section style={{ padding:'20px 5% 100px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:40, alignItems:'start' }}>

            {/* Info column */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={{ visible:{ transition:{ staggerChildren:0.12 } } }}>
              <motion.div variants={fadeUp} style={{ marginBottom:32 }}>
                <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:22, fontWeight:700, color:'#f1f5f9', marginBottom:10 }}>Contact Information</h2>
                <p style={{ fontSize:14, color:'#64748b', lineHeight:1.7 }}>Reach out via any of the channels below. Our support team is available Monday–Saturday, 8am–8pm.</p>
              </motion.div>
              {contactInfo.map((c) => (
                <motion.div key={c.label} variants={fadeUp} whileHover={{ x:4 }}
                  style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, marginBottom:14, transition:'all 0.2s' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}15`, border:`1px solid ${c.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <c.icon size={20} color={c.color} />
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:c.color, letterSpacing:'0.6px', textTransform:'uppercase', marginBottom:4 }}>{c.label}</p>
                    <p style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{c.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form column */}
            <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.2 }}>
              <div style={{ padding:36, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, backdropFilter:'blur(16px)' }}>
                <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:24 }}>Send a Message</h2>
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Name *</label>
                      <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} placeholder="Your name" required
                        onFocus={(e) => { e.target.style.borderColor='rgba(168,85,247,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(168,85,247,0.08)'; }}
                        onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Email *</label>
                      <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email:e.target.value })} placeholder="you@example.com" required
                        onFocus={(e) => { e.target.style.borderColor='rgba(168,85,247,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(168,85,247,0.08)'; }}
                        onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Subject</label>
                    <input style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject:e.target.value })} placeholder="How can we help?"
                      onFocus={(e) => { e.target.style.borderColor='rgba(168,85,247,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(168,85,247,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Message *</label>
                    <textarea style={{ ...inputStyle, resize:'vertical', minHeight:120 }} value={form.message} onChange={(e) => setForm({ ...form, message:e.target.value })} placeholder="Tell us more..."
                      onFocus={(e) => { e.target.style.borderColor='rgba(168,85,247,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(168,85,247,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                  <button type="submit" disabled={loading || sent}
                    style={{ padding:'14px', fontSize:14, fontWeight:700, color:'#fff', background: sent ? 'rgba(16,185,129,0.8)' : 'linear-gradient(135deg,#a855f7,#3b82f6)', border:'none', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(168,85,247,0.25)', transition:'all 0.25s', opacity: loading ? 0.7 : 1 }}>
                    {sent ? <><CheckCircle size={16} /> Message Sent!</> : loading ? <><Loader2 size={16} className="al-spin" /> Sending...</> : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
