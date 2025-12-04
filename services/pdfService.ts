import { FullProposal } from '../types';

/**
 * 提案書を HTML 形式に変換
 */
export function proposalToHtml(proposal: FullProposal): string {
  const content = proposal.jp;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.productNameSuggestions?.[0] || '提案書'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Serif JP', serif;
      line-height: 1.8;
      color: #333;
      background: #f5f3f0;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      border-bottom: 3px solid #C9A961;
      padding-bottom: 30px;
      margin-bottom: 40px;
      text-align: center;
    }
    
    h1 {
      font-size: 32px;
      color: #3d3d3d;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .tagline {
      font-size: 18px;
      color: #C9A961;
      font-style: italic;
    }
    
    h2 {
      font-size: 22px;
      color: #3d3d3d;
      margin-top: 40px;
      margin-bottom: 20px;
      border-left: 4px solid #C9A961;
      padding-left: 15px;
      font-weight: 600;
    }
    
    h3 {
      font-size: 16px;
      color: #3d3d3d;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    p {
      margin-bottom: 15px;
      text-align: justify;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .ingredient-item {
      background: #f5f3f0;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 3px solid #C9A961;
    }
    
    .ingredient-name {
      font-weight: 600;
      color: #3d3d3d;
      margin-bottom: 5px;
    }
    
    .ingredient-detail {
      font-size: 13px;
      color: #666;
      margin: 3px 0;
    }
    
    .internal-material {
      display: inline-block;
      background: #C9A961;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      margin-left: 10px;
    }
    
    .function-list {
      list-style: none;
    }
    
    .function-list li {
      margin-bottom: 15px;
      padding-left: 25px;
      position: relative;
    }
    
    .function-list li:before {
      content: "▪";
      color: #C9A961;
      position: absolute;
      left: 0;
    }
    
    .function-title {
      font-weight: 600;
      color: #3d3d3d;
    }
    
    .function-evidence {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
    }
    
    .package-item {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    
    .package-name {
      font-weight: 600;
      color: #3d3d3d;
      margin-bottom: 10px;
    }
    
    .package-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 13px;
      color: #666;
    }
    
    .cost-table {
      background: #f5f3f0;
      padding: 15px;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .cost-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
    }
    
    .cost-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
      font-weight: 600;
      color: #3d3d3d;
    }
    
    .email-draft {
      background: #f5f3f0;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
      font-size: 13px;
      white-space: pre-wrap;
      word-wrap: break-word;
      border-left: 3px solid #C9A961;
    }
    
    .email-title {
      font-weight: 600;
      color: #3d3d3d;
      margin-bottom: 10px;
    }
    
    .next-actions {
      list-style-position: inside;
      margin-left: 20px;
    }
    
    .next-actions li {
      margin-bottom: 8px;
      color: #666;
    }
    
    .page-break {
      page-break-after: always;
      margin: 40px 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- ヘッダー -->
    <div class="header">
      <h1>${content.productNameSuggestions?.[0] || '提案書'}</h1>
      <div class="tagline">${content.tagline || ''}</div>
    </div>

    <!-- エグゼクティブサマリー -->
    ${content.executiveSummary ? `
    <div class="section">
      <h2>エグゼクティブサマリー</h2>
      <p>${content.executiveSummary}</p>
    </div>
    ` : ''}

    <!-- コンセプト -->
    <div class="section">
      <h2>コンセプト</h2>
      <p>${content.conceptSummary || ''}</p>
    </div>

    <!-- 主要成分 -->
    ${content.mainIngredients && content.mainIngredients.length > 0 ? `
    <div class="section">
      <h2>主要成分</h2>
      ${content.mainIngredients.map(ingredient => `
        <div class="ingredient-item">
          <div class="ingredient-name">
            ${ingredient.commonName}
            ${ingredient.isInternalMaterial ? '<span class="internal-material">自社原料</span>' : ''}
          </div>
          <div class="ingredient-detail">INCI: ${ingredient.inci}</div>
          <div class="ingredient-detail">配合: ${ingredient.percentageRange}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- 期待される機能 -->
    ${content.expectedFunctions && content.expectedFunctions.length > 0 ? `
    <div class="section">
      <h2>期待される機能</h2>
      <ul class="function-list">
        ${content.expectedFunctions.map(func => `
          <li>
            <div class="function-title">${func.func}</div>
            <div class="function-evidence">${func.evidence}</div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- パッケージ提案 -->
    ${content.packageProposals && content.packageProposals.length > 0 ? `
    <div class="section">
      <h2>パッケージ提案</h2>
      ${content.packageProposals.map(pkg => `
        <div class="package-item">
          <div class="package-name">${pkg.name}</div>
          <div class="package-details">
            <div><strong>容量:</strong> ${pkg.capacity}</div>
            <div><strong>素材:</strong> ${pkg.material}</div>
            <div><strong>MOQ:</strong> ${pkg.moq}</div>
            <div><strong>納期:</strong> ${pkg.leadTime}</div>
            <div><strong>装飾:</strong> ${pkg.decoration}</div>
            <div><strong>コスト:</strong> ${pkg.costRange}</div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- コスト見積 -->
    ${content.costRange ? `
    <div class="section">
      <h2>コスト見積</h2>
      <div class="cost-table">
        <div class="cost-row">
          <span>原料</span>
          <span>${content.costRange.materials}</span>
        </div>
        <div class="cost-row">
          <span>充填</span>
          <span>${content.costRange.filling}</span>
        </div>
        <div class="cost-row">
          <span>容器</span>
          <span>${content.costRange.container}</span>
        </div>
        <div class="cost-row">
          <span>印刷</span>
          <span>${content.costRange.printing}</span>
        </div>
        <div class="cost-row">
          <span>合計</span>
          <span>${content.costRange.total}</span>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- 規制上の注記 -->
    ${content.regulatoryNotes ? `
    <div class="section">
      <h2>規制上の注記</h2>
      <p>${content.regulatoryNotes}</p>
    </div>
    ` : ''}

    <!-- リスク -->
    ${content.risksAndUncertainties ? `
    <div class="section">
      <h2>リスクと不確実性</h2>
      <p>${content.risksAndUncertainties}</p>
    </div>
    ` : ''}

    <!-- 次のアクション -->
    ${content.nextActions && content.nextActions.length > 0 ? `
    <div class="section">
      <h2>次のアクション</h2>
      <ol class="next-actions">
        ${content.nextActions.map(action => `<li>${action}</li>`).join('')}
      </ol>
    </div>
    ` : ''}

    <!-- メールドラフト -->
    ${content.emailDrafts ? `
    <div class="page-break"></div>
    <div class="section">
      <h2>メールドラフト</h2>
      
      ${content.emailDrafts.standard ? `
      <div class="email-draft">
        <div class="email-title">標準版</div>
        ${content.emailDrafts.standard}
      </div>
      ` : ''}
      
      ${content.emailDrafts.formal ? `
      <div class="email-draft">
        <div class="email-title">フォーマル版</div>
        ${content.emailDrafts.formal}
      </div>
      ` : ''}
      
      ${content.emailDrafts.casual ? `
      <div class="email-draft">
        <div class="email-title">カジュアル版</div>
        ${content.emailDrafts.casual}
      </div>
      ` : ''}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * 提案書を PDF として出力
 */
export function downloadProposalAsPdf(proposal: FullProposal, filename: string = 'proposal.pdf'): void {
  const html = proposalToHtml(proposal);

  // html2pdf ライブラリを使用
  const element = document.createElement('div');
  element.innerHTML = html;

  // 簡易的な PDF 出力（ブラウザの印刷機能を使用）
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // 印刷ダイアログを表示
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * 提案書を HTML ファイルとしてダウンロード
 */
export function downloadProposalAsHtml(proposal: FullProposal, filename: string = 'proposal.html'): void {
  const html = proposalToHtml(proposal);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
