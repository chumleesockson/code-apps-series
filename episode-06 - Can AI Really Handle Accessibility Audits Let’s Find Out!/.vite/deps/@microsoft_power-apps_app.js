import {
  executePluginAsync,
  initialize
} from "./chunk-TCCU4CRZ.js";
import "./chunk-G3PMV62Z.js";

// node_modules/@microsoft/power-apps/lib/app/ContextProvider.js
var context;
async function getContext() {
  if (context) {
    return context;
  }
  context = await executePluginAsync("AppLifecycle", "getContext");
  return context;
}
export {
  getContext,
  initialize
};
//# sourceMappingURL=@microsoft_power-apps_app.js.map
