"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import AIAssistant from '../components/AIAssistant';

export default function Home() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: '', time: '', location: '',
    volunteerName: '', volunteerRole: '', volunteerEmail: '', volunteerPhone: '',
    subjectName: '', subjectPhone: '', subjectAddress: '',
    parentName: '', parentPhone: '', parentAddress: '',
    referralSource: '', referralReason: '',
    shelterLocation: '', shelterLocationCustom: '', consultationProcess: '', mainComplaint: '',
    obsInjuryStatus: '', obsInjuryDesc: '',
    obsSleep: '', obsAppetite: '', obsEnergy: '', obsResilience: '',
    understanding: '',
    triageLevel: '', triageAction: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainComplaint: formData.mainComplaint,
          observation: `受傷狀況：${formData.obsInjuryStatus === '已處理之外傷' ? formData.obsInjuryDesc : '無外傷'}，睡眠：${formData.obsSleep}，食慾：${formData.obsAppetite}，能量：${formData.obsEnergy}，行為：${formData.obsResilience}`,
          understanding: formData.understanding
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "分析失敗");
      }
      setAiResult(data);
      // Auto-fill triage suggestions to form
      let mappedLevel = '';
      if (data.level) {
        const lv = data.level.toLowerCase();
        if (lv.includes('severe') || lv.includes('重度')) mappedLevel = 'Severe';
        else if (lv.includes('mild') || lv.includes('輕微')) mappedLevel = 'Mild';
        else if (lv.includes('moderate') || lv.includes('中度')) mappedLevel = 'Moderate';
        else mappedLevel = data.level;
      }

      setFormData(prev => ({
        ...prev,
        triageLevel: mappedLevel,
        triageAction: data.suggestedAction
      }));
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      alert(error.message === 'Missing required fields' ? '請先填寫「當事人主訴內容」與「理解與澄清摘要」再進行 AI 分析。' : (error.message || "AI 分析失敗，請稍後再試。"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shelterLocation: formData.shelterLocation === '其他' ? formData.shelterLocationCustom : formData.shelterLocation,
          aiLevel: aiResult?.level || '',
          aiReasoning: aiResult?.reasoning || '',
          aiSuggestedAction: aiResult?.suggestedAction || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedRecordId(data.recordId || 'Unknown');
        setStep(5);
      } else {
        alert("送出失敗，請聯絡系統管理員。");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-export-content');
    if (!element) return;
    
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin:       15,
      filename:     `ListeningEar_${submittedRecordId || 'Report'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ position: 'relative' }}>
        <h1 className={styles.title}>傾聽耳 (Listening Ear)</h1>
        <p className={styles.subtitle}>Safe from Harm 會談安全紀錄系統 (絕對機密)</p>
        <button 
          type="button" 
          onClick={() => setIsTestMode(!isTestMode)} 
          style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            padding: '5px 10px', borderRadius: '4px', 
            backgroundColor: isTestMode ? '#ff9800' : '#f0f0f0',
            color: isTestMode ? '#fff' : '#666',
            border: 'none', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          {isTestMode ? '測試模式：開啟' : '測試模式：關閉'}
        </button>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`${styles.step} ${step === s ? styles.active : ''} ${step > s ? styles.completed : ''}`}
            onClick={() => isTestMode && setStep(s)}
            style={{ cursor: isTestMode ? 'pointer' : 'default' }}
            title={isTestMode ? `跳至步驟 ${s}` : undefined}
          >
            {s}
          </div>
        ))}
      </div>

      <form className={`glass-panel ${styles.formCard}`} onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="step-content">
            <h2 className={styles.sectionTitle}>1. 基本資訊 (Info)</h2>
            <div className="form-group">
              <label className="form-label">日期與時間</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input required={!isTestMode} type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} />
                <input required={!isTestMode} type="time" name="time" className="form-input" value={formData.time} onChange={handleInputChange} />
              </div>
            </div>
            <h3 style={{marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)'}}>傾聽耳 (志工) 資訊</h3>
            <div className="form-group">
              <label className="form-label">志工姓名</label>
              <input required={!isTestMode} type="text" name="volunteerName" className="form-input" value={formData.volunteerName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">志工職務 (選填)</label>
                  <input type="text" name="volunteerRole" className="form-input" value={formData.volunteerRole} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">志工電話 (選填)</label>
                  <input type="tel" name="volunteerPhone" className="form-input" value={formData.volunteerPhone} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">志工 Email (選填)</label>
              <input type="email" name="volunteerEmail" className="form-input" value={formData.volunteerEmail} onChange={handleInputChange} />
            </div>

            <h3 style={{marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)'}}>當事人 (求助者) 資訊</h3>
            <div className="form-group">
              <label className="form-label">當事人姓名 (可化名)</label>
              <input required={!isTestMode} type="text" name="subjectName" className="form-input" value={formData.subjectName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">當事人電話 (選填)</label>
                  <input type="tel" name="subjectPhone" className="form-input" value={formData.subjectPhone} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">當事人地址 (選填)</label>
                  <input type="text" name="subjectAddress" className="form-input" value={formData.subjectAddress} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <h3 style={{marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)'}}>家長/監護人資訊 (若為未成年)</h3>
            <div className="form-group">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">家長姓名 (選填)</label>
                  <input type="text" name="parentName" className="form-input" value={formData.parentName} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">家長電話 (選填)</label>
                  <input type="tel" name="parentPhone" className="form-input" value={formData.parentPhone} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>家長地址 (選填)</label>
                <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#666' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, parentAddress: prev.subjectAddress }));
                      } else {
                        setFormData(prev => ({ ...prev, parentAddress: '' }));
                      }
                    }} 
                  />
                  同當事人地址
                </label>
              </div>
              <input type="text" name="parentAddress" className="form-input" value={formData.parentAddress} onChange={handleInputChange} />
            </div>

            <h3 style={{marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)'}}>會談來源</h3>
            <div className="form-group">
              <label className="form-label">來源</label>
              <select required={!isTestMode} name="referralSource" className="form-input" value={formData.referralSource} onChange={handleInputChange}>
                <option value="">請選擇會談來源...</option>
                <option value="自行求助">自行求助</option>
                <option value="由他人轉介">由他人轉介</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">前來會談之原因 (選填)</label>
              <input type="text" name="referralReason" className="form-input" value={formData.referralReason} onChange={handleInputChange} placeholder="請簡述前來的原因..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className={styles.sectionTitle}>2. 環境設定與開放對話 (S.C.)</h2>
            <div className="form-group">
              <label className="form-label">Shelter: 會談地點</label>
              <select required={!isTestMode} name="shelterLocation" className="form-input" value={formData.shelterLocation} onChange={handleInputChange}>
                <option value="">請選擇地點...</option>
                <option value="靜心室/安全空間">大會靜心室/安全空間</option>
                <option value="營地帳篷">營地帳篷</option>
                <option value="醫療站">醫療站</option>
                <option value="其他">其他</option>
              </select>
              {formData.shelterLocation === '其他' && (
                <input required={!isTestMode} type="text" name="shelterLocationCustom" className="form-input" style={{marginTop: '0.5rem'}} value={formData.shelterLocationCustom} onChange={handleInputChange} placeholder="請輸入自訂地點..." />
              )}
              <span className="form-hint">確保會談在免受外界干擾、感官超載度低的庇護所進行。</span>
            </div>
            <div className="form-group">
              <label className="form-label">會談流程 (選填)</label>
              <textarea name="consultationProcess" className="form-input" rows={2} value={formData.consultationProcess} onChange={handleInputChange} placeholder="如：中途有其他人員加入、突然被打斷、轉換會談地點等" />
            </div>
            <div className="form-group">
              <label className="form-label">Communication: 當事人主訴內容</label>
              <textarea required={!isTestMode} name="mainComplaint" className="form-input" rows={5} value={formData.mainComplaint} onChange={handleInputChange} placeholder="請盡量使用個案的原話（逐字稿）來記錄..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className={styles.sectionTitle}>3. 觀察與理解 (O.U.)</h2>
            <div className="form-group">
              <label className="form-label">Observation: 有無受傷</label>
              <select required={!isTestMode} name="obsInjuryStatus" className="form-input" value={formData.obsInjuryStatus} onChange={handleInputChange}>
                <option value="">請選擇...</option>
                <option value="目視來談者無外傷">目視來談者無外傷</option>
                <option value="已處理之外傷">已處理之外傷</option>
              </select>
              {formData.obsInjuryStatus === '已處理之外傷' && (
                <input required={!isTestMode} type="text" name="obsInjuryDesc" className="form-input" style={{marginTop: '0.5rem'}} value={formData.obsInjuryDesc} onChange={handleInputChange} placeholder="請手動填寫外傷與處理說明..." />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Observation: 觀察指標 (其他)</label>
              <input type="text" name="obsSleep" placeholder="睡眠狀況 (如：失眠、做惡夢)" className="form-input" style={{marginBottom: '0.5rem'}} value={formData.obsSleep} onChange={handleInputChange} />
              <input type="text" name="obsAppetite" placeholder="食慾現況 (如：胃口不佳)" className="form-input" style={{marginBottom: '0.5rem'}} value={formData.obsAppetite} onChange={handleInputChange} />
              <input type="text" name="obsEnergy" placeholder="能量與興趣 (如：對活動失去興趣)" className="form-input" style={{marginBottom: '0.5rem'}} value={formData.obsEnergy} onChange={handleInputChange} />
              <input type="text" name="obsResilience" placeholder="情緒困擾與行為表現" className="form-input" value={formData.obsResilience} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Understand: 志工理解與澄清摘要</label>
              <textarea required={!isTestMode} name="understanding" className="form-input" rows={4} value={formData.understanding} onChange={handleInputChange} placeholder="總結您的理解，例如：『經過確認，個案的核心焦慮來源是因為...』" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2 className={styles.sectionTitle}>4. 檢傷分類與處置 (Triage)</h2>
            
            <AIAssistant isLoading={isAnalyzing} result={aiResult} onAnalyze={handleAnalyze} />

            <div className="form-group">
              <label className="form-label">人工覆核：風險評估分類</label>
              <select required={!isTestMode} name="triageLevel" className="form-input" value={formData.triageLevel} onChange={handleInputChange}>
                <option value="">請選擇最終分類...</option>
                <option value="Mild">Mild: 輕度 (陪伴安撫 / 轉介 LE)</option>
                <option value="Moderate">Moderate: 中度 (通報 SfH 團隊評估)</option>
                <option value="Severe">Severe: 重度 (立即確保安全 / 啟動 24 小時法定通報)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">後續轉介動作與說明</label>
              <textarea required={!isTestMode} name="triageAction" className="form-input" rows={3} value={formData.triageAction} onChange={handleInputChange} placeholder="如：轉介大會精神衛生部門、通報 SfH 小組..." />
            </div>
            <div className="form-group">
              <label className={styles.checkboxLabel}>
                <input type="checkbox" required={!isTestMode} />
                <span>我已了解此紀錄具備絕對機密性，並同意遵守 WOSM 安全防護保密條款。</span>
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content" style={{textAlign: 'center'}}>
            <h2 className={styles.sectionTitle} style={{color: '#2e7d32'}}>送出成功</h2>
            <p style={{fontSize: '1.1rem', marginBottom: '1rem'}}>
              表單已安全送出並加密儲存。
            </p>
            <p style={{marginBottom: '2rem'}}>
              <strong>紀錄序號：</strong> {submittedRecordId}
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>返回首頁 / 新增紀錄</button>
              <button type="button" className="btn btn-primary" onClick={handleExportPDF}>匯出 PDF 下載</button>
            </div>
          </div>
        )}

        {step < 5 && (
          <div className={styles.actions}>
            {step > 1 ? (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>上一步</button>
            ) : <div></div>}
            
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {step < 4 ? '下一步' : (isSubmitting ? '加密送出中...' : '確認並送出機密紀錄')}
            </button>
          </div>
        )}
      </form>

      <div style={{ display: 'none' }}>
        <div id="pdf-export-content" style={{ padding: '20px', fontFamily: 'sans-serif', color: '#000', backgroundColor: '#fff' }}>
          <h1 style={{ borderBottom: '2px solid #5c4b8e', color: '#5c4b8e', paddingBottom: '10px' }}>傾聽耳 (Listening Ear) 會談紀錄</h1>
          
          <div style={{ marginBottom: '20px' }}>
            <p><strong>紀錄序號：</strong> {submittedRecordId}</p>
            <p><strong>發生日期：</strong> {formData.date} <strong>時間：</strong> {formData.time}</p>
            <p><strong>會談地點：</strong> {formData.shelterLocation === '其他' ? formData.shelterLocationCustom : formData.shelterLocation}</p>
            <p><strong>會談來源：</strong> {formData.referralSource} {formData.referralReason ? `(${formData.referralReason})` : ''}</p>
          </div>

          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>志工資訊</h3>
          <p>姓名：{formData.volunteerName} | 職務：{formData.volunteerRole} | 電話：{formData.volunteerPhone} | Email: {formData.volunteerEmail}</p>

          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>當事人資訊</h3>
          <p>姓名：{formData.subjectName} | 電話：{formData.subjectPhone}</p>
          <p>地址：{formData.subjectAddress}</p>
          
          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>家長資訊</h3>
          <p>姓名：{formData.parentName} | 電話：{formData.parentPhone}</p>
          <p>地址：{formData.parentAddress}</p>

          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>會談內容</h3>
          <p><strong>會談流程：</strong> {formData.consultationProcess}</p>
          <p><strong>主訴內容：</strong><br/> {formData.mainComplaint}</p>
          
          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>觀察與理解</h3>
          <p><strong>有無受傷：</strong> {formData.obsInjuryStatus} {formData.obsInjuryStatus === '已處理之外傷' ? `(${formData.obsInjuryDesc})` : ''}</p>
          <p><strong>睡眠狀況：</strong> {formData.obsSleep}</p>
          <p><strong>食慾現況：</strong> {formData.obsAppetite}</p>
          <p><strong>能量與興趣：</strong> {formData.obsEnergy}</p>
          <p><strong>情緒與行為：</strong> {formData.obsResilience}</p>
          <p><strong>理解摘要：</strong><br/> {formData.understanding}</p>

          <h3 style={{ backgroundColor: '#f0f0f0', padding: '5px' }}>AI 輔助評估與處置</h3>
          <p><strong>檢傷分類：</strong> {formData.triageLevel}</p>
          <p><strong>處置作法：</strong><br/> {formData.triageAction}</p>

          <div style={{ marginTop: '40px', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            * 本文件包含高度機密個人隱私資訊，請依循 Safe from Harm 原則妥善保管，嚴禁外流。
          </div>
        </div>
      </div>
    </div>
  );
}
