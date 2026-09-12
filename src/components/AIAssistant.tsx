import React from 'react';
import styles from './AIAssistant.module.css';

interface AIAssistantProps {
  isLoading: boolean;
  result: {
    level: 'Mild' | 'Moderate' | 'Severe' | null;
    reasoning: string;
    suggestedAction: string;
  } | null;
  onAnalyze: () => void;
}

export default function AIAssistant({ isLoading, result, onAnalyze }: AIAssistantProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>🤖</div>
        <h3 className={styles.title}>AI 檢傷分類輔助</h3>
      </div>
      
      {!result && !isLoading && (
        <div className={styles.emptyState}>
          <p>完成「觀察(O)」與「理解(U)」填寫後，點擊下方按鈕讓 AI 協助評估檢傷層級。</p>
          <button type="button" className="btn btn-primary" onClick={onAnalyze}>
            開始 AI 評估
          </button>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>AI 正在分析會談內容中...</p>
        </div>
      )}

      {result && !isLoading && (
        <div className={styles.resultState}>
          <div className={`${styles.levelBadge} ${styles[result.level?.toLowerCase() || '']}`}>
            建議層級：{result.level === 'Mild' ? '輕微 (Mild)' : result.level === 'Moderate' ? '中度 (Moderate)' : '重度 (Severe)'}
          </div>
          <div className={styles.resultBox}>
            <h4>判斷理由：</h4>
            <p>{result.reasoning}</p>
          </div>
          <div className={styles.resultBox}>
            <h4>建議作法：</h4>
            <p>{result.suggestedAction}</p>
          </div>
          {result.level === 'Severe' && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '2px solid #ef9a9a' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🚨</span> 法律紅線觸發：嚴重警示
              </h4>
              <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                本案涉及疑似兒少保護或重大性平事件，請嚴守「知悉即通報（24小時內）」天條！<br/>
                <strong style={{ textDecoration: 'underline', color: '#b71c1c' }}>切勿私下查證</strong>，請立即通報營本部與 SfH 團隊啟動法定通報流程。
              </p>
            </div>
          )}
          <p className={styles.warningText}>
            ⚠️ 提醒：AI 建議僅供參考，請傾聽耳志工務必人工覆核並在下方確認最終分類。
          </p>
        </div>
      )}
    </div>
  );
}
