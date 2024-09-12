<html>
  <head>
    <style>
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Thin.ttf");
        font-weight: 100;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Light.ttf");
        font-weight: 300;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Regular.ttf");
        font-weight: normal;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Medium.ttf");
        font-weight: 500;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Semibold.ttf");
        font-weight: 600;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Bold.ttf");
        font-weight: bold;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-Black.ttf");
        font-weight: 900;
      }

      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-RegularItalic.ttf");
        font-style: italic;
      }
      @font-face {
        font-family: "Calibre";
        src: url("/font/Calibre-BoldItalic.ttf");
        font-weight: bold;
        font-style: italic;
      }

      :root {
        --color-gray: #58595b;
        --color-green: #0dd345;
      }

      body {
        width: 21cm;
        height: 29.7cm;
        margin: 0 auto;

        font-family: Calibre;
        font-weight: normal;
        font-style: normal;
      }

      .text.thin {
        font-weight: 100;
      }
      .text.light {
        font-weight: 300;
      }
      .text.w-500 {
        font-weight: 500;
      }
      .text.semibold {
        font-weight: 600;
      }
      .text.bold {
        font-weight: bold;
      }
      .text.black {
        font-weight: 900;
      }
      .text.italic {
        font-style: italic;
      }

      .text.tiny {
        font-size: 10px;
      }
      .text.small {
        font-size: 14px;
      }
      .text.medium {
        font-size: 20px;
      }
      .text.large {
        font-size: 64px;
      }

      .text.purple {
        color: purple;
      }
      .text.gray {
        color: var(--color-gray);
      }
      .text.green {
        color: var(--color-green);
      }

      .space.tiny {
        height: 10px;
      }
      .space.small {
        height: 20px;
      }
      .space.medium {
        height: 30px;
      }
      .space.large {
        height: 40px;
      }

      .list {
        margin: 0;
        padding: 0;

        list-style: none;
      }

      .flex {
        display: flex;
      }
      .flex.h-center {
        justify-content: center;
      }
      .flex.h-between {
        justify-content: space-between;
      }
      .flex.v-center {
        align-items: center;
      }
      .flex.col {
        flex-direction: column;
      }

      .header {
        margin: 0 48px 0 44px;
      }
      .content {
        margin: 0 48px 0 44px;
      }
    </style>
  </head>

  <body style="outline: 1px solid var(--color-green)">
    <div class="space large" />
    <div class="header h-between v-center flex">
      <div class="col flex">
        <span class="text semibold large" style="letter-spacing: -0.04em"> İbrahim Uğur </span>
        <span class="text semibold small green" style="margin-top: -0.3cm"> Elektrik-Elektronik Mühendisi </span>
      </div>

      <div class="col flex" style="text-align: end">
        <a class="text purple">ibrahim.ugur026@gmail.com</a>
      </div>
    </div>
    <div class="space large" />
    <div class="content flex" style="height: 64%">
      <div class="col left flex" style="width: 36%">
        <div style="margin-bottom: auto">
          <span class="text semibold small green">Y E T E N E K L E R</span>
          <div class="space medium" />
          <span class="text semibold">Yazılım</span>
          <div class="space small" />
          <span class="text gray">HTML</span>
          <div class="space small" />
          <span class="text gray">CSS/SASS</span>
          <div class="space small" />
          <span class="text gray">PHP</span>
          <div class="space small" />
          <span class="text gray">PYTHON</span>
          <div class="space small" />
          <span class="text gray">C++</span>
          <div class="space small" />
          <span class="text gray">SQL</span>
        </div>

        <div style="margin-bottom: auto">
          <span class="text semibold">Tasarım</span>
          <div class="space small" />
          <span class="text gray">Autocad</span>
          <div class="space small" />
          <span class="text gray">SolidWorks</span>
          <div class="space small" />
          <span class="text gray">Photoshop</span>
        </div>

        <div style="margin-bottom: auto">
          <span class="text semibold small green">İLGİLENDİKLERİM</span>
          <div class="space medium" />
          <span class="text gray">ROBOTİK</span>
          <div class="space small" />
          <span class="text gray">E-SPOR</span>
          <div class="space small" />
          <span class="text gray">GÖRÜNTÜ İŞLEME</span>
        </div>
      </div>

      <div class="col right flex" style="width: 64%">
        <div style="margin-bottom: auto">
          <span class="text semibold small green">H A K K I M D A</span>
          <div class="space medium" />
          <span class="text gray" style="line-height: 1.5em">
            20 yaşında mekanik tasarım ve SQL veritabanlarıyla ilgilenen aynı zamanda üniversite öğrenciliğini sürdüren
            biriyim. Yapay zeka alanında gelişmek için projeler geliştirilen ve yarışmalarla uğraşmaktayım.
          </span>
        </div>

        <br />

        <div style="margin-bottom: auto">
          <span class="text semibold small green">PROJELERİM</span>

          <div class="space small" />

          <span class="text semibold">First Robotic Competition</span>
          <div class="space tiny" />
          <span class="text gray"
            >FIRST Robotik Yarışması uluslararası liseler arası robotik yarışmasıdır. Okulumuzda oluşturduğumuz takım
            ile Türkiye’de derece yaparak Amerika Houston’daki yarışmaya katıldık. Houston’da da ülkemizi gururla temsil
            ettik</span
          >
          <div class="space medium" />

          <span class="text semibold">Robotik Eğitmenliği</span>
          <div class="space tiny" />
          <span class="text gray">
            Robotik alanında LEGO, STEM, DREAM setleri üzerinden ortaokul ve lise öğrencilerine gönüllü olarak ders
            verdim.
          </span>
          <div class="space medium" />

          <span class="text semibold">Dondurma Topu Sayacı</span>
          <div class="space tiny" />
          <span class="text gray">
            Dondurma dolabından kaç top dondurma alındığını sayıyor. Obje ve hareket algılama algoritmaları ile yazıldı.
          </span>
          <div class="space medium" />

          <span class="text semibold">Teknofest</span>
          <div class="space tiny" />
          <span class="text gray"
            >2018 IHA-IKA, 2019 Tarım Teknolojileri yarışmalarına takımımla birlikte katıldık.</span
          >
          <div class="space medium" />

          <span class="text semibold">Arbitraj</span>
          <div class="space tiny" />
          <span class="text gray">
            Farklı sitelerden canlı veri çekip arbitraj olasılıklarını hesaplıyor. Bol tersine mühendislik içeriyor.
          </span>
          <div class="space medium" />

          <div class="space tiny" />
        </div>

        <div style="margin-bottom: auto">
          <span class="text semibold small green">EĞİTİM</span>
          <div class="space small" />
          <span class="text">Düzce Üniversitesi Elektrik-Elektronik Mühendisliği</span>
          <br />
          <span class="text tiny">2022 Sep - </span>
          <div class="space small" />
          <span class="text">Türkiye Teknoloji Takımı (T3)</span>
          <br />
          <span class="text tiny">2017 June - 2020 May</span>
        </div>
      </div>
    </div>
  </body>
</html>
