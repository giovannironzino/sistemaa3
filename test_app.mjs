import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const artifactDir = 'C:/Users/giova/.gemini/antigravity/brain/2711fab1-1989-46f2-820a-89b0281355c8';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Iniciando o navegador Chrome...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navegando para http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Screenshot 1: Initial Page
  await page.screenshot({ path: path.join(artifactDir, '01_home_page.png') });
  console.log('Screenshot 1 salvo: 01_home_page.png');

  const pageTitle = await page.title();
  console.log('Título da página:', pageTitle);

  // Check if Auth screen is active
  const emailInput = await page.$('#email_input');
  if (emailInput) {
    console.log('Tela de login/cadastro detectada. Realizando autenticação...');
    
    // First try registering a fresh test user to guarantee full access
    const btnRegisterTab = await page.$('#btn_tab_register');
    if (btnRegisterTab) {
      console.log('Alternando para a aba Criar Conta...');
      await btnRegisterTab.click();
      await new Promise(r => setTimeout(r, 500));
    }

    const testEmail = `nutri_${Date.now()}@teste.com`;
    console.log(`Preenchendo formulário com o e-mail: ${testEmail}`);

    await page.type('#name_input', 'Dra. Nutri Teste');
    await page.type('#email_input', testEmail);
    await page.type('#password_input', '123456');

    // Select Nutricionista role
    const btnRoleNutri = await page.$('#btn_role_nutri');
    if (btnRoleNutri) await btnRoleNutri.click();

    // Submit form
    const btnSubmit = await page.$('#btn_auth_submit');
    if (btnSubmit) {
      console.log('Submetendo cadastro...');
      await btnSubmit.click();
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  // Screenshot 2: Main Dashboard after login
  await page.screenshot({ path: path.join(artifactDir, '02_app_main.png') });
  console.log('Screenshot 2 salvo: 02_app_main.png');

  // Check if Retrato form root is present or if we need to switch view mode
  let retratoRoot = await page.$('#retrato_form_root');
  if (!retratoRoot) {
    console.log('Procurando botões de navegação no header ou dashboard...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Navegar pelos 9 Eixos do Retrato') || text.includes('Ver Eixos') || text.includes('Revisar Respostas'))) {
        console.log(`Clicando no botão: "${text.trim()}"`);
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        break;
      }
    }
  }

  // Verify all 9 Eixos
  const results = [];
  for (let step = 0; step < 9; step++) {
    // Click axis tab button in Retrato stepper
    const axisClicked = await page.evaluate((axisIndex) => {
      const stepper = document.getElementById('retrato_form_stepper');
      if (stepper) {
        const btns = stepper.querySelectorAll('button');
        if (btns[axisIndex]) {
          btns[axisIndex].click();
          return true;
        }
      }
      return false;
    }, step);

    await new Promise(r => setTimeout(r, 1200));

    const axisInfo = await page.evaluate((axisIndex) => {
      const header = document.querySelector('#retrato_form_root h1');
      const textContent = document.body.innerText;

      // Match all R$ occurrences
      const currencyMatches = textContent.match(/R\$\s*[\d\.\,]+/g) || [];
      
      // Look for subtotals or cards
      const subtotalsText = Array.from(document.querySelectorAll('div, span, p'))
        .map(el => el.textContent.trim())
        .filter(t => (t.includes('Subtotal') || t.includes('DRE') || t.includes('Custo Mensal') || t.includes('Faturamento Meta')) && t.length < 80)
        .slice(0, 5);

      return {
        step: axisIndex + 1,
        title: header ? header.textContent.trim() : `Eixo ${axisIndex + 1}`,
        currencyCount: currencyMatches.length,
        sampleCurrencies: Array.from(new Set(currencyMatches)).slice(0, 5),
        subtotalsFound: subtotalsText
      };
    }, step);

    const screenshotName = `eixo_${step + 1}.png`;
    await page.screenshot({ path: path.join(artifactDir, screenshotName) });
    console.log(`[Eixo ${step + 1}] "${axisInfo.title}" - R$ formatados encontrados: ${axisInfo.currencyCount} (${axisInfo.sampleCurrencies.join(', ')})`);
    results.push(axisInfo);
  }

  console.log('\n=========================================');
  console.log('RESUMO DA VERIFICAÇÃO DOS 9 EIXOS:');
  console.log('=========================================');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
})();
