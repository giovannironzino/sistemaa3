/* @ds-bundle: {"format":4,"namespace":"XodoReportsDesignSystem_8f1e86","components":[{"name":"Callout","sourcePath":"components/content/Callout.jsx"},{"name":"DotGrid","sourcePath":"components/content/DotGrid.jsx"},{"name":"PageHeader","sourcePath":"components/content/PageHeader.jsx"},{"name":"PullQuote","sourcePath":"components/content/PullQuote.jsx"},{"name":"SectionTopic","sourcePath":"components/content/SectionTopic.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CornerAccent","sourcePath":"components/core/CornerAccent.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"BarChart","sourcePath":"components/data/BarChart.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"StatBlock","sourcePath":"components/data/StatBlock.jsx"},{"name":"PageFooter","sourcePath":"components/navigation/PageFooter.jsx"},{"name":"SectionNav","sourcePath":"components/navigation/SectionNav.jsx"}],"sourceHashes":{"components/content/Callout.jsx":"4c6813cc20d1","components/content/DotGrid.jsx":"c869f6db72c0","components/content/PageHeader.jsx":"a702f1a71c3b","components/content/PullQuote.jsx":"39389622c942","components/content/SectionTopic.jsx":"b172efcf27e6","components/core/Button.jsx":"a431229c1904","components/core/Card.jsx":"32eea64c5803","components/core/CornerAccent.jsx":"127a2bf40348","components/core/Divider.jsx":"7b5105964f62","components/core/Tag.jsx":"598626deb0a4","components/data/BarChart.jsx":"76d9eba54a3c","components/data/DataTable.jsx":"4116b1616d34","components/data/StatBlock.jsx":"83d234ffc049","components/navigation/PageFooter.jsx":"8f8e26e62acc","components/navigation/SectionNav.jsx":"2f9da4691541","ui_kits/report/CostStructurePage.jsx":"09cfde90cc4b","ui_kits/report/CoverPage.jsx":"5866e0947d69","ui_kits/report/OverviewPage.jsx":"56e39c7dfb33","ui_kits/report/RevenueModelPage.jsx":"ef6b4f5dd95b","ui_kits/report/StrategicReadingPage.jsx":"ee572ab3158d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.XodoReportsDesignSystem_8f1e86 = window.XodoReportsDesignSystem_8f1e86 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/Callout.jsx
try { (() => {
function Callout({
  label = 'Ponto de Atenção',
  children,
  tone = 'default',
  style
}) {
  const accent = tone === 'accent';
  const color = accent ? 'var(--exodo-red)' : 'var(--preto)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      background: 'var(--cinza-claro)',
      padding: '20px 24px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      border: `2px solid ${color}`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.9rem',
      flexShrink: 0
    }
  }, "!"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-primary)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Callout.jsx", error: String((e && e.message) || e) }); }

// components/content/DotGrid.jsx
try { (() => {
function DotGrid({
  rows = 6,
  cols = 10,
  style
}) {
  const dots = [];
  for (let i = 0; i < rows * cols; i++) {
    dots.push(i);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols},1fr)`,
      gap: '14px',
      width: 'fit-content',
      ...style
    }
  }, dots.map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: 'var(--cinza-medio)'
    }
  })));
}
Object.assign(__ds_scope, { DotGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/DotGrid.jsx", error: String((e && e.message) || e) }); }

// components/content/PageHeader.jsx
try { (() => {
function PageHeader({
  label,
  index,
  question,
  intro,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '980px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--exodo-red)'
    }
  }, index), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '24px',
      height: '1px',
      background: 'var(--border-strong)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--text-secondary)'
    }
  }, label)), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-question)',
      lineHeight: 1.18,
      letterSpacing: 'var(--tracking-tight)',
      margin: 0,
      color: 'var(--text-primary)'
    }
  }, question), intro ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-lg)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-secondary)',
      maxWidth: '640px',
      margin: 0
    }
  }, intro) : null);
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/content/PullQuote.jsx
try { (() => {
function PullQuote({
  children,
  attribution,
  style
}) {
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '2.5rem',
      lineHeight: 0.5,
      color: 'var(--exodo-red)'
    }
  }, "\u275D"), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: 'var(--text-display)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--text-primary)'
    }
  }, children), attribution ? /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '16px',
      height: '2px',
      background: 'var(--exodo-red)'
    }
  }), attribution) : null);
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionTopic.jsx
try { (() => {
function SectionTopic({
  label,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '14px',
      height: '2px',
      background: 'var(--exodo-red)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap'
    }
  }, label)), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-h1)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--text-primary)'
    }
  }, children));
}
Object.assign(__ds_scope, { SectionTopic });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionTopic.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const base = {
  fontFamily: 'var(--font-subtitle)',
  fontSize: 'var(--text-small)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wide)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-none)',
  padding: '12px 22px',
  background: 'transparent',
  color: 'var(--text-primary)',
  transition: 'background .15s ease,color .15s ease,border-color .15s ease'
};
const variants = {
  primary: {
    background: 'var(--exodo-red)',
    color: 'var(--branco)',
    border: '1px solid var(--exodo-red)'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--exodo-red)',
    border: '1px solid var(--exodo-red)'
  },
  tertiary: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--cinza-medio)'
  },
  link: {
    background: 'transparent',
    color: 'var(--exodo-red)',
    border: '1px solid transparent',
    padding: '4px 0'
  }
};
const hover = {
  primary: {
    background: 'var(--preto)',
    border: '1px solid var(--preto)'
  },
  secondary: {
    background: 'var(--exodo-red)',
    color: 'var(--branco)'
  },
  tertiary: {
    background: 'var(--preto)',
    color: 'var(--branco)',
    border: '1px solid var(--preto)'
  },
  link: {
    color: 'var(--preto)'
  }
};
const sizes = {
  sm: {
    padding: '8px 16px',
    fontSize: '0.7rem'
  },
  md: {},
  lg: {
    padding: '16px 28px',
    fontSize: '0.8rem'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  style
}) {
  const st = {
    ...base,
    ...variants[variant],
    ...(variant !== 'link' ? sizes[size] : {}),
    ...(disabled ? {
      opacity: 0.35,
      cursor: 'not-allowed'
    } : {}),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", {
    style: st,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: e => {
      if (disabled) return;
      Object.assign(e.currentTarget.style, hover[variant]);
    },
    onMouseLeave: e => {
      const v = {
        ...base,
        ...variants[variant],
        ...(variant !== 'link' ? sizes[size] : {})
      };
      Object.assign(e.currentTarget.style, v);
    }
  }, children, variant === 'link' ? /*#__PURE__*/React.createElement("span", null, "\u2192") : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  icon,
  title,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--branco)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cinza-claro)',
      color: 'var(--preto)'
    }
  }, icon) : null, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-primary)'
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.9rem',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-secondary)'
    }
  }, children) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/CornerAccent.jsx
try { (() => {
function CornerAccent({
  variant = 'arredondado',
  size = 100,
  style
}) {
  if (variant === 'fino') return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderTop: '2px solid var(--exodo-red)',
      borderRight: '2px solid var(--exodo-red)',
      ...style
    }
  });
  if (variant === 'medio') return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderTop: '6px solid var(--exodo-red)',
      borderRight: '6px solid var(--exodo-red)',
      ...style
    }
  });
  if (variant === 'diagonal') return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      background: 'var(--exodo-red)',
      clipPath: 'polygon(100% 0,100% 100%,0 100%)',
      ...style
    }
  });
  if (variant === 'barra') return /*#__PURE__*/React.createElement("div", {
    style: {
      width: Math.max(4, size * 0.08),
      height: size,
      background: 'var(--exodo-red)',
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      background: 'var(--exodo-red)',
      borderRadius: `0 ${size}px 0 0`,
      ...style
    }
  });
}
Object.assign(__ds_scope, { CornerAccent });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CornerAccent.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function Divider({
  variant = 'continua',
  style
}) {
  if (variant === 'vertical') return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '1px',
      alignSelf: 'stretch',
      background: 'var(--preto)',
      ...style
    }
  });
  if (variant === 'curta') return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '2px',
      width: '40px',
      background: 'var(--preto)',
      ...style
    }
  });
  if (variant === 'secao') return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '3px',
      width: '100%',
      background: 'var(--exodo-red)',
      ...style
    }
  });
  if (variant === 'pontilhada') return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '1px',
      width: '100%',
      backgroundImage: 'linear-gradient(to right,var(--cinza-medio) 40%,transparent 0%)',
      backgroundSize: '8px 1px',
      backgroundRepeat: 'repeat-x',
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '1px',
      width: '100%',
      background: 'var(--border-default)',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
const tones = {
  diagnostico: {
    color: 'var(--branco)',
    border: '1px solid var(--preto)',
    background: 'var(--preto)'
  },
  evidencia: {
    color: 'var(--exodo-red)',
    border: '1px solid var(--exodo-red)',
    background: 'transparent'
  },
  processo: {
    color: 'var(--cinza-escuro)',
    border: '1px solid var(--cinza-medio)',
    background: 'transparent'
  },
  informacao: {
    color: 'var(--cinza-escuro)',
    border: '1px solid transparent',
    background: 'var(--cinza-claro)'
  }
};
function Tag({
  children,
  tone = 'diagnostico',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      padding: '6px 12px',
      display: 'inline-block',
      lineHeight: 1,
      ...tones[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/BarChart.jsx
try { (() => {
function BarChart({
  data,
  style
}) {
  const max = Math.max(...data.map(d => d.value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '28px',
      height: '180px',
      borderBottom: '1px solid var(--preto)'
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      height: '100%',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: d.highlight ? 'var(--exodo-red)' : 'var(--text-primary)'
    }
  }, d.value), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '56px',
      height: d.value / max * 140 + 'px',
      background: d.highlight ? 'var(--exodo-red)' : 'var(--cinza-claro)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '28px',
      paddingTop: '10px'
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, d.label))));
}
Object.assign(__ds_scope, { BarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarChart.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns,
  rows,
  totalRow,
  style
}) {
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-subtitle)',
      fontSize: '0.85rem',
      ...style
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      textAlign: i === 0 ? 'left' : 'right',
      padding: '10px 12px',
      background: 'var(--cinza-claro)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-secondary)',
      fontWeight: 700,
      fontSize: '0.7rem'
    }
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, r.map((cell, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    style: {
      textAlign: ci === 0 ? 'left' : 'right',
      padding: '10px 12px',
      borderBottom: '1px solid var(--border-default)',
      color: 'var(--text-primary)',
      fontWeight: 500
    }
  }, cell)))), totalRow ? /*#__PURE__*/React.createElement("tr", null, totalRow.map((cell, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    style: {
      textAlign: ci === 0 ? 'left' : 'right',
      padding: '10px 12px',
      borderTop: '2px solid var(--preto)',
      color: 'var(--text-primary)',
      fontWeight: 700
    }
  }, cell))) : null));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/StatBlock.jsx
try { (() => {
function StatBlock({
  value,
  unit,
  label,
  delta,
  style
}) {
  const up = delta && !delta.startsWith('-');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-secondary)'
    }
  }, label), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.75rem',
      color: 'var(--text-tertiary)'
    }
  }, unit) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(2rem,4vw,3.5rem)',
      lineHeight: 1,
      color: 'var(--text-primary)'
    }
  }, value), delta ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '1px',
      background: 'var(--border-default)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.75rem',
      color: up ? 'var(--exodo-red)' : 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, up ? '↗' : '—'), delta)) : null);
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageFooter.jsx
try { (() => {
function PageFooter({
  title,
  methodology,
  sources,
  confidentiality,
  page,
  total,
  date,
  company,
  style
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '1px',
      background: 'var(--border-default)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1.4fr 1.4fr 1.4fr auto',
      gap: '24px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '1.1rem',
      color: 'var(--exodo-red)'
    }
  }, "\xEAxodo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, title)), methodology ? /*#__PURE__*/React.createElement(FooterCol, {
    label: "Metodologia",
    text: methodology
  }) : null, sources ? /*#__PURE__*/React.createElement(FooterCol, {
    label: "Fontes",
    text: sources
  }) : null, confidentiality ? /*#__PURE__*/React.createElement(FooterCol, {
    label: "Confidencialidade",
    text: confidentiality
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '1rem',
      color: 'var(--exodo-red)'
    }
  }, String(page).padStart(2, '0'), " / ", String(total).padStart(2, '0')), date ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.65rem',
      color: 'var(--text-tertiary)'
    }
  }, date) : null, company ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.65rem',
      color: 'var(--text-tertiary)'
    }
  }, company) : null)));
}
function FooterCol({
  label,
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.75rem',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-secondary)'
    }
  }, text));
}
Object.assign(__ds_scope, { PageFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SectionNav.jsx
try { (() => {
function SectionNav({
  sections,
  current,
  onSelect,
  variant = 'padrao',
  icons,
  style
}) {
  if (variant === 'progresso') {
    return /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        ...style
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '9px',
        top: '6px',
        bottom: '6px',
        width: '1px',
        background: 'var(--border-default)'
      }
    }), sections.map((s, i) => {
      const active = i === current;
      const done = i < current;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          gap: '14px',
          position: 'relative',
          zIndex: 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: active ? '12px' : '8px',
          height: active ? '12px' : '8px',
          borderRadius: '50%',
          background: active ? 'var(--exodo-red)' : 'var(--branco)',
          border: active ? 'none' : `2px solid ${done ? 'var(--exodo-red)' : 'var(--cinza-medio)'}`,
          flexShrink: 0,
          marginTop: '4px'
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => onSelect && onSelect(i),
        style: {
          all: 'unset',
          cursor: onSelect ? 'pointer' : 'default'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-subtitle)',
          fontSize: '0.65rem',
          color: 'var(--text-tertiary)'
        }
      }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-subtitle)',
          fontWeight: active ? 700 : 500,
          fontSize: '0.8rem',
          color: active ? 'var(--exodo-red)' : 'var(--text-primary)'
        }
      }, s)));
    }));
  }
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      ...style
    }
  }, sections.map((s, i) => {
    const active = i === current;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onSelect && onSelect(i),
      style: {
        all: 'unset',
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
        borderLeft: active ? '2px solid var(--exodo-red)' : '2px solid var(--border-default)',
        paddingLeft: '14px'
      }
    }, variant === 'icones' && icons ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: '16px',
        display: 'flex',
        color: active ? 'var(--exodo-red)' : 'var(--text-tertiary)'
      }
    }, icons[i]) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-subtitle)',
        fontSize: '0.7rem',
        color: active ? 'var(--exodo-red)' : 'var(--text-tertiary)'
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-subtitle)',
        fontSize: '0.8rem',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--text-primary)' : 'var(--text-tertiary)'
      }
    }, s));
  }));
}
Object.assign(__ds_scope, { SectionNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SectionNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/report/CostStructurePage.jsx
try { (() => {
function CostStructurePage() {
  const {
    PageHeader,
    Callout,
    DataTable,
    Divider
  } = window.XodoReportsDesignSystem_8f1e86;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    index: "03",
    label: "Estrutura de Custos",
    question: "Quanto custa manter um cliente?",
    intro: "O custo de entrega escala com a complexidade da conta, n\xE3o com a receita.",
    style: {
      maxWidth: '760px'
    }
  }), /*#__PURE__*/React.createElement(DataTable, {
    columns: ['Centro de Custo', 'T1', 'T2', '% da Receita'],
    rows: [['Entrega & Suporte', 'R$2,1M', 'R$2,4M', '29%'], ['Vendas & Marketing', 'R$1,4M', 'R$1,5M', '18%'], ['P&D', 'R$0,9M', 'R$1,0M', '12%'], ['G&A', 'R$0,5M', 'R$0,5M', '6%']]
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Callout, {
    label: "Metodologia"
  }, "N\xFAmeros extra\xEDdos de 18 meses de demonstra\xE7\xF5es financeiras internas, normalizados pela receita recorrente trimestral."));
}
window.CostStructurePage = CostStructurePage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/report/CostStructurePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/report/CoverPage.jsx
try { (() => {
function CoverPage() {
  const {
    Tag
  } = window.XodoReportsDesignSystem_8f1e86;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      padding: '64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-color-transparent.png",
    alt: "\xCAxodo",
    style: {
      height: '36px'
    }
  }), /*#__PURE__*/React.createElement(Tag, {
    tone: "inverse"
  }, "Confidencial")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '900px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 700,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: 'var(--exodo-red)'
    }
  }, "Diagn\xF3stico Estrat\xE9gico de Neg\xF3cio"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(3rem,7vw,6rem)',
      lineHeight: 0.95,
      letterSpacing: '-0.01em',
      margin: 0
    }
  }, "Como esta empresa funciona hoje?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '1.25rem',
      color: 'var(--text-secondary)',
      margin: 0,
      maxWidth: '560px'
    }
  }, "Um retrato anal\xEDtico do modelo de neg\xF3cio atual da Acme Co. \u2014 antes de qualquer recomenda\xE7\xE3o.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-subtitle)',
      fontWeight: 600,
      fontSize: '0.75rem',
      color: 'var(--text-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Acme Co. \u2014 Diagn\xF3stico 2026"), /*#__PURE__*/React.createElement("span", null, "Preparado por \xCAxodo")));
}
window.CoverPage = CoverPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/report/CoverPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/report/OverviewPage.jsx
try { (() => {
function OverviewPage() {
  const {
    PageHeader,
    Callout,
    StatBlock,
    Divider
  } = window.XodoReportsDesignSystem_8f1e86;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '56px',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    index: "01",
    label: "Vis\xE3o Geral",
    question: "Que tipo de neg\xF3cio \xE9 esse, estruturalmente?",
    intro: "A Acme Co. opera como um h\xEDbrido \u2014 receita de assinatura sustentada por um pequeno n\xFAmero de contas empresariais de alto contato.",
    style: {
      maxWidth: '760px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "R$18,4M",
    label: "Receita recorrente anual",
    delta: "+11pts a/a"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "62%",
    label: "Receita da maior conta",
    delta: "+4pts a/a"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "18m",
    label: "Reten\xE7\xE3o m\xE9dia empresarial",
    delta: "-2pts a/a"
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Callout, {
    label: "Leitura Estrat\xE9gica"
  }, "Este n\xE3o \xE9 um neg\xF3cio SaaS t\xEDpico \u2014 comporta-se mais como uma consultoria de servi\xE7os gerenciados com faturamento por assinatura. Qualquer diagn\xF3stico de crescimento deve partir da\xED."));
}
window.OverviewPage = OverviewPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/report/OverviewPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/report/RevenueModelPage.jsx
try { (() => {
function RevenueModelPage() {
  const {
    PageHeader,
    Callout,
    BarChart,
    PullQuote,
    Divider
  } = window.XodoReportsDesignSystem_8f1e86;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    index: "02",
    label: "Modelo de Receita",
    question: "De onde vem o dinheiro, de fato?",
    intro: "Tr\xEAs canais geram 94% da receita, mas apenas um est\xE1 crescendo.",
    style: {
      maxWidth: '760px'
    }
  }), /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      label: 'Direto Empresarial',
      value: 62,
      highlight: true
    }, {
      label: 'Parceiros de Canal',
      value: 24
    }, {
      label: 'Autoatendimento',
      value: 14
    }]
  }), /*#__PURE__*/React.createElement(PullQuote, {
    attribution: "Descoberta 02"
  }, "O crescimento est\xE1 sendo financiado por expans\xE3o em contas existentes, n\xE3o por aquisi\xE7\xE3o de novos clientes."), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Callout, {
    label: "Leitura Estrat\xE9gica",
    tone: "accent"
  }, "A concentra\xE7\xE3o direta empresarial n\xE3o \xE9 inerentemente arriscada \u2014 mas hoje est\xE1 indocumentada e n\xE3o precificada no plano de vendas."));
}
window.RevenueModelPage = RevenueModelPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/report/RevenueModelPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/report/StrategicReadingPage.jsx
try { (() => {
function StrategicReadingPage() {
  const {
    PageHeader,
    PullQuote,
    Callout
  } = window.XodoReportsDesignSystem_8f1e86;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    index: "04",
    label: "Leitura Estrat\xE9gica",
    question: "Afinal, como esse neg\xF3cio funciona hoje?",
    intro: "Um neg\xF3cio de assinatura que se comporta como uma consultoria de servi\xE7os, hoje precificado como nenhum dos dois.",
    style: {
      maxWidth: '760px'
    }
  }), /*#__PURE__*/React.createElement(PullQuote, {
    attribution: "S\xEDntese Final"
  }, "O neg\xF3cio \xE9 saud\xE1vel. O risco \xE9 que ningu\xE9m registrou o porqu\xEA."), /*#__PURE__*/React.createElement(Callout, {
    label: "Pr\xF3ximo Diagn\xF3stico"
  }, "Este relat\xF3rio propositalmente n\xE3o avan\xE7a para recomenda\xE7\xF5es. Um relat\xF3rio de op\xE7\xF5es estrat\xE9gicas pode ser constru\xEDdo diretamente sobre estas descobertas."));
}
window.StrategicReadingPage = StrategicReadingPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/report/StrategicReadingPage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.DotGrid = __ds_scope.DotGrid;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SectionTopic = __ds_scope.SectionTopic;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CornerAccent = __ds_scope.CornerAccent;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.PageFooter = __ds_scope.PageFooter;

__ds_ns.SectionNav = __ds_scope.SectionNav;

})();
