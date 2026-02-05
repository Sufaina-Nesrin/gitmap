const GLOBAL_KEYWORDS = {
  "readme.md": 80,
  "dockerfile": 40,
  "docker-compose.yml": 35,
  ".env.example": 25,
  "makefile": 20
};

const FRAMEWORK_KEYWORDS = {
  "Django": {
    "manage.py": 90,
    "settings.py": 80,
    "urls.py": 80,
    "views.py": 55,
    "models.py": 55,
    "wsgi.py": 60,
    "asgi.py": 60,
    "requirements.txt": 50,
    "pyproject.toml": 50
  },
  "FastAPI": {
  "main.py": 95,
  "app.py": 85,
  "routers": 80,
  "routes": 70,
  "api": 70,
  "endpoints": 65,

  "database.py": 75,
  "db": 55,

  "models.py": 70,
  "schemas.py": 65,

  "crud.py": 60,
  "services": 55,

  "requirements.txt": 60,
  "pyproject.toml": 60
},
"React": {
  "src/main.tsx": 90,
  "src/index.tsx": 90,
  "src/app.tsx": 80,
  "src/app.jsx": 80,
  "app.tsx": 70,
  "app.jsx": 70,
  "routes": 45,
  "pages": 45,
  "components": 35,
  "package.json": 60
},


  "Next.js": {
    "next.config.js": 85,
    "app/": 70,
    "pages/": 70,
    "package.json": 60
  },

  "Node": {
    "server": 80,
    "index": 75,
    "app": 75,
    "routes": 50,
    "controllers": 45,
    "middleware": 35,
    "services": 30,
    "package.json": 60
  },

  "Spring": {
    "src/main/java": 70,
    "pom.xml": 60,
    "build.gradle": 60,
    "application.yml": 55,
    "application.properties": 55
  },

  "Rails": {
    "gemfile": 60,
    "config/routes.rb": 80,
    "app/controllers": 65,
    "app/models": 55
  },

  "Rust": {
    "cargo.toml": 70,
    "src/main.rs": 80
  }


};

function getExecutionFlow(framework) {
  if (framework === "Django") return "Request → urls.py → views.py → services → models(DB)";
  if (framework === "Next.js") return "Browser → pages/app → API route/server action → DB";
  if (framework === "Node") return "Request → middleware → routes → controller → service → DB";
  if (framework === "Spring") return "Request → Controller → Service → Repository → DB";
  if (framework === "Rails") return "Request → routes.rb → controller → model → DB";
  if (framework === "Rust") return "Request → router/handler → service → DB";
  return "Entry → Routes → Core Logic → External Services/DB";
}

module.exports = { GLOBAL_KEYWORDS, FRAMEWORK_KEYWORDS, getExecutionFlow };
