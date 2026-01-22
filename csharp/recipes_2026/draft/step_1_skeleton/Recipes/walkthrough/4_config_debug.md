# VS Code Debugging Guide for .NET API + BFF + Angular

A complete guide to set up debugging for a .NET backend (API + BFF) with an Angular frontend in Visual Studio Code.

## Prerequisites

- Visual Studio Code installed
- C# Dev Kit extension installed
- .NET SDK installed (check with `dotnet --version`)
- Node.js and npm installed

## Project Structure

```
Recipes/
├── Recipes.sln
├── .vscode/                    # VS Code configuration (we'll create this)
│   ├── launch.json
│   └── tasks.json
└── src/
    ├── Recipes.Api/            # Your API project
    │   └── Properties/
    │       └── launchSettings.json
    ├── Recipes.Bff/            # Your BFF project
    │   └── Properties/
    │       └── launchSettings.json
    └── recipes-ui/             # Your Angular app
        ├── proxy.conf.js       # Proxy configuration
        ├── angular.json
        └── package.json
```

## Step 1: Create VS Code Debug Configuration

### 1.1 Create `.vscode/launch.json`

Create this file in your **project root** (same level as `Recipes.sln`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "API (http://localhost:7000)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-api",
      "program": "${workspaceFolder}/src/Recipes.Api/bin/Debug/net8.0/Recipes.Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Recipes.Api",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_URLS": "http://localhost:7000"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "openOnSessionStart"
    },
    {
      "name": "BFF (http://localhost:7001)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-bff",
      "program": "${workspaceFolder}/src/Recipes.Bff/bin/Debug/net8.0/Recipes.Bff.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Recipes.Bff",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_URLS": "http://localhost:7001"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "openOnSessionStart"
    }
  ],
  "compounds": [
    {
      "name": "API + BFF (Both Services)",
      "configurations": ["API (http://localhost:7000)", "BFF (http://localhost:7001)"],
      "stopAll": true,
      "preLaunchTask": "build-all"
    }
  ]
}
```

**Important**: Adjust the `net8.0` part to match your .NET version (check your `.csproj` files for `<TargetFramework>`).

### 1.2 Create `.vscode/tasks.json`

Create this file in `.vscode/` folder:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-api",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/Recipes.Api/Recipes.Api.csproj",
        "/property:GenerateFullPaths=true",
        "/consoleloggerparameters:NoSummary;ForceNoAlign"
      ],
      "problemMatcher": "$msCompile",
      "group": "build"
    },
    {
      "label": "build-bff",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/Recipes.Bff/Recipes.Bff.csproj",
        "/property:GenerateFullPaths=true",
        "/consoleloggerparameters:NoSummary;ForceNoAlign"
      ],
      "problemMatcher": "$msCompile",
      "group": "build"
    },
    {
      "label": "build-all",
      "dependsOn": ["build-api", "build-bff"],
      "group": "build"
    }
  ]
}
```

## Step 2: Configure BFF Reverse Proxy

Your BFF acts as a proxy between Angular and the API. Configure it to forward all requests.

### 2.1 Update `src/Recipes.Bff/appsettings.json`

```json
{
  "ReverseProxy": {
    "Routes": {
      "apiRoute": {
        "ClusterId": "apiCluster",
        "Match": { "Path": "{**catch-all}" }
      }
    },
    "Clusters": {
      "apiCluster": {
        "Destinations": {
          "api": { "Address": "http://localhost:7000/" }
        }
      }
    }
  }
}
```

**Key point**: `{**catch-all}` forwards ALL paths to the API.

## Step 3: Configure Angular Proxy

Angular needs to proxy API calls to the BFF during development.

### 3.1 Create `src/recipes-ui/proxy.conf.js`

```javascript
const PROXY_CONFIG = {
  "/health": {
    "target": "http://localhost:7001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/api": {
    "target": "http://localhost:7001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}

module.exports = PROXY_CONFIG;
```

### 3.2 Update `src/recipes-ui/angular.json`

Find the `"serve"` section and add the proxy configuration:

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.js"
  },
  "configurations": {
    "production": {
      "buildTarget": "recipes-ui:build:production"
    },
    "development": {
      "buildTarget": "recipes-ui:build:development"
    }
  },
  "defaultConfiguration": "development"
}
```

### 3.3 Update `src/recipes-ui/package.json`

Add the proxy config to the start script:

```json
"scripts": {
  "start": "ng serve --proxy-config proxy.conf.js",
  "build": "ng build",
  ...
}
```

## Step 4: Start Debugging

### 4.1 Start Backend Services

1. In VS Code, press **F5** (or click Run → Start Debugging)
2. Select **"API + BFF (Both Services)"** from the dropdown
3. Wait for both services to start - you'll see two terminal tabs open

You should see:
```
API: Now listening on: http://localhost:7000
BFF: Now listening on: http://localhost:7001
```

### 4.2 Start Angular

Open a new terminal and run:

```bash
cd src/recipes-ui
npm start
```

Angular will start on `http://localhost:4200`

### 4.3 Set Breakpoints

1. Open any `.cs` file in your API or BFF
2. Click in the gutter (left of line numbers) to add a red dot breakpoint
3. When your Angular app makes a request, the breakpoint will hit!

## Step 5: Test the Setup

### 5.1 Example Angular Component

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Recipes</h1>
    <button (click)="ping()">Ping API</button>
    <pre>{{ result }}</pre>
  `
})
export class AppComponent {
  result = '';

  async ping() {
    const response = await fetch('/health');
    const data = await response.text();
    this.result = data;
  }
}
```

### 5.2 Verify the Flow

When you click "Ping API":

1. Angular calls `/health`
2. Angular proxy forwards to BFF at `http://localhost:7001/health`
3. BFF reverse proxy forwards to API at `http://localhost:7000/health`
4. **Your breakpoint in the API hits!** ✓
5. Response flows back through BFF to Angular

## Debug Controls

Once stopped at a breakpoint:

- **F5** - Continue
- **F10** - Step Over
- **F11** - Step Into
- **Shift+F11** - Step Out
- **Shift+F5** - Stop Debugging
- **Ctrl+Shift+F5** - Restart

## Troubleshooting

### Breakpoints Not Hitting?

1. Make sure both API and BFF are running (check terminals)
2. Verify Angular proxy is working: `curl http://localhost:4200/health` should return API response, not HTML
3. Check that breakpoint is in the actual code path being executed
4. Look at Debug Console for error messages

### Proxy Not Working?

1. Completely restart Angular after changing proxy config
2. Verify `proxy.conf.js` exists in `src/recipes-ui/` (same level as `package.json`)
3. Check `angular.json` has `"proxyConfig": "proxy.conf.js"`
4. Test BFF directly: `curl http://localhost:7001/health`

### Port Conflicts?

If ports 7000, 7001, or 4200 are already in use:

1. Update ports in `launch.json` (ASPNETCORE_URLS)
2. Update ports in `proxy.conf.js` (target)
3. Update ports in BFF's `appsettings.json` (Address)

### Wrong .NET Version?

Check your actual .NET version:
```bash
dotnet --version
```

Then update the paths in `launch.json`:
- Change `net8.0` to `net6.0`, `net7.0`, `net9.0`, etc.

## Tips

- **Debug one service at a time**: Select "API" or "BFF" individually during development
- **Use integrated terminal**: Set `"console": "integratedTerminal"` to see clear output
- **Watch variables**: Hover over variables while debugging to see their values
- **Debug Console**: View detailed output in the Debug Console panel
- **Conditional breakpoints**: Right-click a breakpoint to add conditions

## Summary

Your debugging setup includes:

✅ VS Code launch configurations for API and BFF  
✅ Compound configuration to debug both simultaneously  
✅ BFF reverse proxy forwarding to API  
✅ Angular proxy forwarding to BFF  
✅ Full request flow: Angular → BFF → API  

Now you can set breakpoints anywhere in your C# code and they'll hit when Angular makes requests!