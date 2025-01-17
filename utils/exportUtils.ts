export function generateHtmlContent(jsonData: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文字冒险游戏</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: #333;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    .scenario-image {
      max-width: 100%;
      height: auto;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    #scenario-text {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      background-color: #3498db;
      color: white;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .btn:hover {
      background-color: #2980b9;
    }
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 id="scenario-title">文字冒险游戏</h1>
    <img id="scenario-image" class="scenario-image" style="display: none;" alt="场景图片">
    <p id="scenario-text"></p>
    <div id="choices-container"></div>
  </div>

  <script>
    const scenarios = ${jsonData};
    let currentScenario = scenarios[0];

    function displayScenario(scenarioId) {
      currentScenario = scenarios.find(s => s.id === scenarioId);
      document.getElementById('scenario-text').textContent = currentScenario.text;
      
      const imageElement = document.getElementById('scenario-image');
      if (currentScenario.image) {
        imageElement.src = currentScenario.image;
        imageElement.style.display = 'block';
      } else {
        imageElement.style.display = 'none';
      }

      const choicesContainer = document.getElementById('choices-container');
      choicesContainer.innerHTML = '';
      currentScenario.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.textContent = choice.text;
        btn.className = 'btn';
        btn.onclick = () => displayScenario(choice.nextId);
        choicesContainer.appendChild(btn);
      });
    }

    displayScenario(1);
  </script>
</body>
</html>
`;
}

