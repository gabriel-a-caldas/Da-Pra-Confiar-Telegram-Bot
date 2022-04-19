const env = require("./.env");
const Telegraf = require("telegraf");
const bot = new Telegraf(env.token);
const puppeteer = require("puppeteer");

bot.start((ctx) => {
  const from = ctx.update.message.from;

  console.log(from);
  ctx.reply(`Muito bem-vindo, ${from.first_name}!`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "→ 💲 Melhor preço", callback_data: "MP" }],
        [{ text: "→ 💸 Promoções Imperdíveis", callback_data: "PI" }],
        [{ text: "→ 🔍 Ver reputação de uma empresa", callback_data: "RP" }],
        [{ text: "→ ❓ Ajuda", callback_data: "AJ" }],
      ],
    },
  });
});

bot.action("MP", (ctx) => {
  ctx.reply(
    "Deseja buscar somente em lojas confiáveis ou em todas as lojas? ",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "→ ✅ Lojas Confiáveis (Reclame Aqui > 7)",
              callback_data: "LC",
            },
          ],
          [{ text: "→ 🏬 Todas As Lojas", callback_data: "ALL" }],
        ],
      },
    }
  );
  
  bot.action("LC", (ctx) => {       
    let urlalvo;
    let consultaproduto;
  urlalvo = "https://www.amazon.com.br";
  ctx.reply("Digite o nome do produto");
  
  bot.on("text", (ctx) => {
    
    consultaproduto = ctx.message.text;
    
    async function botamazon(consulta){
      const nomebusca = consulta.replace(/ /, '-');
      const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
        });
        const page = await browser.newPage();
      
        await page.goto(urlalvo);
        await page.waitForSelector('#twotabsearchtextbox');
        await page.type('#twotabsearchtextbox', consulta);
        await page.keyboard.press('Enter');
      
        await page.waitForTimeout(2000);
        await page.waitForSelector('.a-price-whole');
        await page.screenshot({ path: `${nomebusca}.png`, fullPage: true });
      
        let vlrpreco = '';
        const valor = await page.evaluate(() => {
          let centena = document.querySelector('.a-price-whole');
      
          if (centena != null) {
            let centena = document.querySelector('.a-price-whole').textContent;
            let centavos = document.querySelector('.a-price-fraction').textContent;
            let valor = `${centena}${centavos}`;
            let semvirgula = valor.replace(',', '.');
            return semvirgula;
          } else {
            vlrpreco = 0;
          }
          return vlrpreco;
        });
        await browser.close();
        ctx.reply(`Valor de ${consultaproduto} em Amazon Brasil: R$` + valor +"\n →Comprar ");
  }
  botamazon(consultaproduto)
  });
  
  });
  
}); 

bot.action("PI", (ctx) => {
  ctx.deleteMessage();
  ctx.reply("A função Promoções Imperdíveis está por vir");
});

bot.action("RP", (ctx) => {
  let urlalvo;
  let consultaproduto;

  urlalvo = "https://www.reclameaqui.com.br/";
  ctx.reply("Digite o nome da empresa:");

  bot.on("text", (ctx) => {
    consultaproduto = ctx.message.text;

    async function botamazon(consulta1) {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });
      const page = await browser.newPage();

      await page.goto(urlalvo);
      await page.waitForSelector(".form-search.input-auto-complete-search");
      await page.type(".form-search.input-auto-complete-search", consulta1);
      await page.keyboard.press("Enter");

      await page.waitForTimeout(2000);
      await page.waitForSelector(".score");

      let vlrpreco = "";
      const valor = await page.evaluate(() => {
        let centena = document.querySelector(".score");

        if (centena != null) {
          let centena = document.querySelector(".score").textContent;

          let valor = `${centena}`;
          let semvirgula = valor.replace(",", ".");
          return semvirgula;
        } else {
          vlrpreco = 0;
        }
        return vlrpreco;
      });
      const empresalink = consultaproduto.replace(/ /, "-");
      await browser.close();
      ctx.reply("Aguarde...");
      if (isNaN(valor)) { //se avaliação tiver '--' no site != de numero
        ctx.reply(
          `A avaliação de ${consultaproduto} não é informada ` +
            ` Atenção 🛑🛑\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      }
      if (valor == 0 || valor < 2) {
        ctx.reply(
          ` Reputação de ${consultaproduto} no Reclame Aqui: ` +
            valor +
            ` Cuidado 😬\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      } else if (valor == 2 || valor < 4) {
        ctx.reply(
          `Reputação de ${consultaproduto} no Reclame Aqui: ` +
            valor +
            ` Neutra 😐\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      } else if (valor == 4 || valor < 6) {
        ctx.reply(
          `Reputação de ${consultaproduto} no Reclame Aqui: ` +
            valor +
            ` Interessante 🤔\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      } else if (valor == 6 || valor < 8) {
        ctx.reply(
          `Reputação de ${consultaproduto} no Reclame Aqui: ` +
            valor +
            ` Boa empresa 😏\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      } else if (valor == 8 || valor < 10) {
        ctx.reply(
          `Reputação de ${consultaproduto} no Reclame Aqui: ` +
            valor +
            ` Aí sim! 😀\nhttps://www.reclameaqui.com.br/empresa/${empresalink.toLowerCase()}/`
        );
      }
    }

    botamazon(consultaproduto);
  });
});

//email
bot.action("AJ", (ctx) => {
  ctx.deleteMessage();

  ctx.reply("Ajuda: \n→Suporte: \nE-Mail: suporte@transversal.com", {
    reply_markup: {
      inline_keyboard: [[{ text: "→ Reportar Erro", callback_data: "ERR" }]],
    },
  });

  bot.action("ERR", (ctx) => {
    let erroreport;

    ctx.reply("Digite o problema que está tendo");

    bot.on("text", (ctx) => {
      erroreport = ctx.message.text;
      var mailOptions = {
        from: email,
        to: email,
        subject: "Report de ERRO",
        text: `Report de erro de usuário: ${erroreport}\n ${new Date()}`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          ctx.reply("Serviço Indisponível");
        } else {
          ctx.reply("O erro foi reportado!\n Obrigado");
        }
      });
    });
  });
});

bot.startPolling();
