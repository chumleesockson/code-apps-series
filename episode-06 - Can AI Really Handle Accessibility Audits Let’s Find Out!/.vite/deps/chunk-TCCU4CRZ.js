// node_modules/@microsoft/power-apps/lib/internal/data/core/error/codes.js
var ErrorCodes;
(function(ErrorCodes2) {
  ErrorCodes2["InitializationFailed"] = "PDR_INIT_FAILED";
  ErrorCodes2["InvalidXrmInfo"] = "INVALID_XRM_INFO";
  ErrorCodes2["OperationsNotInitialized"] = "OPS_NOT_INITIALIZED";
  ErrorCodes2["InvalidOperationExecutor"] = "INVALID_OPERATION_EXECUTOR";
  ErrorCodes2["DataSourceNotFound"] = "CONNECTION_NOT_FOUND";
  ErrorCodes2["DuplicateDataSource"] = "DUPLICATE_DATA_SOURCE";
  ErrorCodes2["InitializationError"] = "RDSS_INIT_ERROR";
  ErrorCodes2["InvalidDataSource"] = "INVALID_DATA_SOURCE";
  ErrorCodes2["DataSourcesInfoNotFound"] = "DATA_SOURCES_INFO_NOT_FOUND";
  ErrorCodes2["DataClientInitFailed"] = "DATA_CLIENT_INIT_FAILED";
  ErrorCodes2["DataClientNotInitialized"] = "DATA_CLIENT_NOT_INITIALIZED";
  ErrorCodes2["MetadataClientInitFailed"] = "METADATA_CLIENT_INIT_FAILED";
  ErrorCodes2["MetadataClientNotInitialized"] = "METADATA_CLIENT_NOT_INITIALIZED";
  ErrorCodes2["ClientProviderNotAvailable"] = "CLIENT_PROVIDER_NOT_AVAILABLE";
  ErrorCodes2["ConnectionReferenceNotFound"] = "CONNECTION_REFERENCE_NOT_FOUND";
  ErrorCodes2["DataClientNotAvailable"] = "DATA_CLIENT_NOT_AVAILABLE";
  ErrorCodes2["DataSourceServiceNotAvailable"] = "DATA_SOURCE_SERVICE_NOT_AVAILABLE";
  ErrorCodes2["MetadataClientNotAvailable"] = "METADATA_CLIENT_NOT_AVAILABLE";
  ErrorCodes2["ConnectionConfigFetchFailed"] = "CONNECTION_CONFIG_FETCH_FAILED";
  ErrorCodes2["DataSourceConfigFetchFailed"] = "DATA_SOURCE_CONFIG_FETCH_FAILED";
  ErrorCodes2["InvalidMetadataResponse"] = "INVALID_METADATA_RESPONSE";
  ErrorCodes2["TokenAcquisitionFailed"] = "TOKEN_ACQUISITION_FAILED";
})(ErrorCodes || (ErrorCodes = {}));

// node_modules/@microsoft/power-apps/lib/internal/data/core/error/messages.js
var UnknownErrorMessage = "An unknown error occurred";
var ErrorMessages = {
  // PowerDataRuntime specific errors
  [ErrorCodes.InitializationFailed]: "Failed to initialize PowerDataRuntime",
  [ErrorCodes.InvalidXrmInfo]: "Xrm info is required",
  [ErrorCodes.OperationsNotInitialized]: "PowerDataRuntime is not initialized",
  // RuntimeDataSourceService specific errors
  [ErrorCodes.DataSourceNotFound]: "Data source not found",
  [ErrorCodes.DuplicateDataSource]: "Duplicate data source",
  [ErrorCodes.InitializationError]: "Failed to initialize RuntimeDataSourceService",
  [ErrorCodes.InvalidDataSource]: "Invalid data source",
  // PowerDataSourcesInfoProvider specific errors
  [ErrorCodes.DataSourcesInfoNotFound]: "DataSourcesInfo must be provided to initialize the singleton instance.",
  // DataClientProvider specific errors
  [ErrorCodes.DataClientInitFailed]: "Failed to initialize PowerDataClient",
  [ErrorCodes.DataClientNotInitialized]: "PowerDataClient is not initialized",
  [ErrorCodes.MetadataClientInitFailed]: "Failed to initialize PowerMetadataClient",
  [ErrorCodes.MetadataClientNotInitialized]: "PowerMetadataClient is not initialized",
  // DataOperation specific errors
  [ErrorCodes.ClientProviderNotAvailable]: "Client provider is not available",
  [ErrorCodes.ConnectionReferenceNotFound]: "Connection reference not found",
  [ErrorCodes.DataClientNotAvailable]: "PowerDataClient is not available",
  [ErrorCodes.DataSourceServiceNotAvailable]: "Data source service is not available",
  [ErrorCodes.MetadataClientNotAvailable]: "PowerMetadataClient is not available",
  // MetadataClient specific errors
  [ErrorCodes.ConnectionConfigFetchFailed]: "Failed to fetch connection configurations",
  [ErrorCodes.DataSourceConfigFetchFailed]: "Failed to fetch data source configurations",
  [ErrorCodes.InvalidMetadataResponse]: "Invalid metadata response format",
  // RuntimeDataClient specific errors
  [ErrorCodes.TokenAcquisitionFailed]: "Failed to acquire access token"
};
var DataOperationErrorMessages;
(function(DataOperationErrorMessages2) {
  DataOperationErrorMessages2["CreateFailed"] = "Create operation failure";
  DataOperationErrorMessages2["DeleteFailed"] = "Delete operation failure";
  DataOperationErrorMessages2["ExecuteFailed"] = "Execute operation failure";
  DataOperationErrorMessages2["InvalidOperationParameters"] = "Invalid operation parameters";
  DataOperationErrorMessages2["InvalidRequest"] = "Invalid request";
  DataOperationErrorMessages2["InvalidResponse"] = "Invalid response format";
  DataOperationErrorMessages2["MissingConnectorOperation"] = "Connector operation is required";
  DataOperationErrorMessages2["MissingDataverseRequest"] = "Dataverse request is required";
  DataOperationErrorMessages2["MissingOperationName"] = "Operation name is required";
  DataOperationErrorMessages2["MissingRequestBody"] = "Request body is required";
  DataOperationErrorMessages2["RetrieveFailed"] = "Retrieve operation failure";
  DataOperationErrorMessages2["RetrieveMultipleFailed"] = "Retrieve multiple records operation failure";
  DataOperationErrorMessages2["UpdateFailed"] = "Update operation failure";
})(DataOperationErrorMessages || (DataOperationErrorMessages = {}));

// node_modules/@microsoft/power-apps/lib/internal/data/core/types/index.js
function isOperationResult(result) {
  return result?.success !== void 0;
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/telemetry/log.js
var ServiceName = "PublishedAppTelemetry";
var TelemetryActionNames;
(function(TelemetryActionNames2) {
  TelemetryActionNames2["trackEvent"] = "trackEvent";
  TelemetryActionNames2["trackException"] = "trackException";
  TelemetryActionNames2["trackMetric"] = "trackMetric";
  TelemetryActionNames2["startScenario"] = "startScenario";
  TelemetryActionNames2["endScenario"] = "endScenario";
  TelemetryActionNames2["setDefaultProperties"] = "setDefaultProperties";
})(TelemetryActionNames || (TelemetryActionNames = {}));
var Log = class _Log {
  _powerOperationExecutor;
  static _instance = null;
  constructor(_powerOperationExecutor) {
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  static createInstance(powerOperationExecutor) {
    if (!_Log._instance) {
      _Log._instance = new _Log(powerOperationExecutor);
    } else {
      _Log.trackEvent("TelemetryLogger", {
        message: "Attempted to create an instance when instance is already created."
      });
    }
    return _Log._instance;
  }
  // Since powerDataRuntime can be reset, we need to be able to reset the instance of Log as well.
  static resetInstance() {
    _Log._instance = null;
  }
  static async _sendMessage(actionName, ...args) {
    try {
      const instance = _Log._getInstance();
      const result = await instance._powerOperationExecutor.execute(ServiceName, actionName, args);
      if (!result.success) {
        console.error({
          message: `PowerDataRuntime.TelemetryLogger: Failed to send telemetry message.`,
          error: result.error,
          telemetryArgs: args
        });
      }
    } catch (error) {
      console.error({
        message: `PowerDataRuntime.TelemetryLogger: Failed to send telemetry message.`,
        error,
        telemetryArgs: args
      });
    }
  }
  static trackEvent(eventName, eventData) {
    return _Log._sendMessage(TelemetryActionNames.trackEvent, `PowerDataRuntime.${eventName}`, eventData);
  }
  static trackException(exception) {
    return _Log._sendMessage(TelemetryActionNames.trackException, exception);
  }
  static trackMetric(metricName, value) {
    return _Log._sendMessage(TelemetryActionNames.trackMetric, `PowerDataRuntime.${metricName}`, value);
  }
  static startScenario(scenarioName) {
    return _Log._sendMessage(TelemetryActionNames.startScenario, `PowerDataRuntime.${scenarioName}`);
  }
  static endScenario(scenarioName) {
    return _Log._sendMessage(TelemetryActionNames.endScenario, `PowerDataRuntime.${scenarioName}`);
  }
  static setDefaultProperties(properties) {
    return _Log._sendMessage(TelemetryActionNames.setDefaultProperties, properties);
  }
  static _getInstance() {
    if (!_Log._instance) {
      throw new Error("PowerDataRuntime.TelemetryLogger: Attempted to log telemetry prior to instantiation.");
    }
    return _Log._instance;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/error/types.js
var PowerDataRuntimeError = class extends Error {
  code;
  /**
   * Creates an instance of PowerDataRuntimeError.
   * @param code - The error code associated with the error.
   * @param additionalInfo - Optional additional information to include in the error message.
   * @param messageOverride - Optional override for the default error message.
   */
  constructor(code, additionalInfo, messageOverride) {
    let message = messageOverride || ErrorMessages[code] || UnknownErrorMessage;
    if (additionalInfo) {
      message += `: ${additionalInfo}`;
    }
    super(message);
    this.code = code;
    this.name = "PowerDataRuntimeError";
    Log.trackException(this);
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/error/constants.js
var HeaderNames;
(function(HeaderNames2) {
  HeaderNames2["RequestId"] = "x-ms-client-request-id";
})(HeaderNames || (HeaderNames = {}));
var DataverseOperationName;
(function(DataverseOperationName2) {
  DataverseOperationName2["CreateRecord"] = "dataverseDataOperation.createRecordAsync";
  DataverseOperationName2["UpdateRecord"] = "dataverseDataOperation.updateRecordAsync";
  DataverseOperationName2["DeleteRecord"] = "dataverseDataOperation.deleteRecordAsync";
  DataverseOperationName2["RetrieveRecord"] = "dataverseDataOperation.retrieveRecordAsync";
  DataverseOperationName2["RetrieveMultipleRecords"] = "dataverseDataOperation.retrieveMultipleRecordsAsync";
})(DataverseOperationName || (DataverseOperationName = {}));
var ConnectorOperationName;
(function(ConnectorOperationName2) {
  ConnectorOperationName2["CreateRecord"] = "connectorDataOperation.createRecordAsync";
  ConnectorOperationName2["UpdateRecord"] = "connectorDataOperation.updateRecordAsync";
  ConnectorOperationName2["DeleteRecord"] = "connectorDataOperation.deleteRecordAsync";
  ConnectorOperationName2["RetrieveRecord"] = "connectorDataOperation.retrieveRecordAsync";
  ConnectorOperationName2["RetrieveMultipleRecords"] = "connectorDataOperation.retrieveMultipleRecordsAsync";
})(ConnectorOperationName || (ConnectorOperationName = {}));

// node_modules/@microsoft/power-apps/lib/internal/data/core/error/util.js
function getErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error || error instanceof PowerDataRuntimeError) {
    return error.message || UnknownErrorMessage;
  }
  if (isOperationResult(error)) {
    return error.error?.message || UnknownErrorMessage;
  }
  if (typeof error === "object") {
    return JSON.stringify(error);
  }
  return UnknownErrorMessage;
}
function createErrorResponse(error, friendlyMessage) {
  const message = getErrorMessage(error);
  let data;
  if (isOperationResult(error)) {
    data = error.data;
  }
  const errorData = new Error(`${friendlyMessage}: ${message}`);
  if (error instanceof Error) {
    errorData.stack = error.stack;
  }
  return {
    success: false,
    error: errorData,
    data
  };
}
function parseHttpPluginError(error) {
  let message = UnknownErrorMessage;
  let response;
  if (Array.isArray(error)) {
    if (Array.isArray(error[0])) {
      message = error[0][0] || UnknownErrorMessage;
      response = error[0][2];
    }
  }
  const status = response?.status;
  const requestId = response?.headers?.[HeaderNames.RequestId];
  return {
    message,
    status,
    requestId
  };
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtime/initializeRuntime.js
var _executor;
var _initialized = false;
function initializeRuntime(executor) {
  if (_initialized) {
    return;
  }
  if (!executor) {
    throw new PowerDataRuntimeError(ErrorCodes.InvalidOperationExecutor, "PowerDataRuntime is not initialized. Please call initializeRuntime() first.");
  }
  _executor = executor;
  _initialized = true;
}
function getExecutor() {
  if (!_executor) {
    throw new PowerDataRuntimeError(ErrorCodes.InvalidOperationExecutor, "PowerDataRuntime is not initialized. Please call initializeRuntime() first.");
  }
  return _executor;
}

// node_modules/@microsoft/power-apps/lib/internal/plugin/PluginMobile.js
var cordovaOperationsQueue = [];
function executePendingCordovaOperations() {
  for (let i = 0; i < cordovaOperationsQueue.length; i++) {
    cordovaOperationsQueue[i]();
  }
  cordovaOperationsQueue = [];
}
function executePlugin(pluginName, pluginAction, params = []) {
  if (typeof cordova !== "undefined") {
    cordova.exec(
      // eslint-disable-next-line no-empty-function
      () => {
      },
      // eslint-disable-next-line no-empty-function
      () => {
      },
      pluginName,
      pluginAction,
      params
    );
  } else {
    cordovaOperationsQueue.push(() => {
      cordova.exec(
        // eslint-disable-next-line no-empty-function
        () => {
        },
        // eslint-disable-next-line no-empty-function
        () => {
        },
        pluginName,
        pluginAction,
        params
      );
    });
  }
}
function executePluginAsync(pluginName, pluginAction, params = []) {
  return new Promise((resolve, reject) => {
    if (typeof cordova !== "undefined") {
      cordova.exec(resolve, reject, pluginName, pluginAction, params);
    } else {
      cordovaOperationsQueue.push(() => {
        cordova.exec(resolve, reject, pluginName, pluginAction, params);
      });
    }
  });
}
async function initializeMobilePlugins() {
  await new Promise((resolve, reject) => {
    reject("Mobile is currently not supported");
  });
  executePendingCordovaOperations();
}
function isMobilePlayer() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("loaderType") === "reactnative";
}

// node_modules/@microsoft/power-apps/lib/internal/plugin/PluginCommon.js
var antiCSRFToken;
var currentCallbackId = 0;
var callbacks = {};
var postMessageSource;
var instanceId = Date.now().toString();
var postMessageQueue = [];
async function initializePlugins() {
  if (isMobilePlayer()) {
    await initializeMobilePlugins();
  } else {
    initializeMessageChannel();
  }
}
function executePluginAsync2(pluginName, pluginAction, params = [], update) {
  if (isMobilePlayer()) {
    return executePluginAsync(pluginName, pluginAction, params);
  }
  return new Promise((resolve, reject) => {
    const callbackId = getCallbackId(pluginName);
    callbacks[callbackId] = { resolve, reject, update };
    sendMessage({
      isPluginCall: true,
      callbackId,
      service: pluginName,
      action: pluginAction,
      actionArgs: params,
      antiCSRFToken
    });
  });
}
function executePlugin2(pluginName, pluginAction, params = []) {
  if (isMobilePlayer()) {
    executePlugin(pluginName, pluginAction, params);
    return;
  }
  sendMessage({
    isPluginCall: true,
    callbackId: getCallbackId(pluginName),
    service: pluginName,
    action: pluginAction,
    actionArgs: params,
    antiCSRFToken
  });
}
function initializeMessageChannel() {
  const messageChannel = new window.MessageChannel();
  messageChannel.port1.onmessage = createMessageHandler(messageChannel);
  window.parent.postMessage({
    messageType: "initCommunicationWithPort",
    instanceId
  }, "*", [messageChannel.port2]);
}
function getCallbackId(pluginName) {
  return "instanceId=" + instanceId + "_" + pluginName + currentCallbackId++;
}
function sendMessage(message) {
  if (!postMessageSource) {
    postMessageQueue.push(message);
  } else {
    postMessageSource.postMessage(message);
  }
}
function createMessageHandler(messageChannel) {
  return (messageEvent) => {
    const message = messageEvent.data;
    if (message && typeof message.isPluginCall === "boolean") {
      if (message.isPluginCall) {
        const callbackId = message.callbackId;
        const status = message.status;
        const args = message.args;
        const keepCallback = message.keepCallback;
        try {
          const callback = callbacks[callbackId];
          if (keepCallback) {
            if (callback && callback.update) {
              callback.update(message.args?.[0]);
            }
          } else {
            if (callback) {
              if (status === 1) {
                callback.resolve(args[0]);
              } else if (status !== 0) {
                callback.reject(args);
              }
            }
            if (!keepCallback) {
              delete callbacks[callbackId];
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else if (message && message.messageType === "initCommunication") {
      antiCSRFToken = message.antiCSRFToken;
      postMessageSource = messageChannel.port1;
      if (postMessageSource) {
        for (let i = 0; i < postMessageQueue.length; i++) {
          postMessageQueue[i].antiCSRFToken = antiCSRFToken;
          postMessageSource.postMessage(postMessageQueue[i]);
        }
      }
    }
  };
}

// node_modules/@microsoft/power-apps/lib/internal/data/ConnectionUtils.js
var connectionsLoaded = false;
async function loadConnections() {
  if (connectionsLoaded) {
    return;
  }
  connectionsLoaded = true;
  await loadNonCompositeConnectionsAsync();
  await resolveCompositeConnectionsAsync();
}
async function loadNonCompositeConnectionsAsync() {
  return executePluginAsync2("AppPowerAppsClientPlugin", "loadNonCompositeConnectionsAsync", []);
}
async function resolveCompositeConnectionsAsync() {
  return executePluginAsync2("AppPowerAppsClientPlugin", "resolveCompositeConnectionsAsync", []);
}

// node_modules/@microsoft/power-apps/lib/internal/data/OperationExecutor.js
var loadConnectionsPromise;
var OperationExecutor = class {
  /**
   * Executes an operation using the plugin.
   * @param operationName The name of the operation.
   * @param action The action to perform.
   * @param params The parameters for the operation.
   * @returns A promise resolving to the operation result.
   */
  async execute(operationName, action, params) {
    try {
      if (!loadConnectionsPromise) {
        loadConnectionsPromise = loadConnections();
      }
      await loadConnectionsPromise;
      const result = await executePluginAsync2(operationName, action, params);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/common/types.js
var HttpMethod;
(function(HttpMethod2) {
  HttpMethod2["GET"] = "GET";
  HttpMethod2["POST"] = "POST";
  HttpMethod2["PUT"] = "PUT";
  HttpMethod2["DELETE"] = "DELETE";
  HttpMethod2["PATCH"] = "PATCH";
})(HttpMethod || (HttpMethod = {}));
var DataSources;
(function(DataSources2) {
  DataSources2["Dataverse"] = "Dataverse";
  DataSources2["Connector"] = "Connector";
})(DataSources || (DataSources = {}));

// node_modules/@microsoft/power-apps/lib/internal/data/core/data/defaultOperationOrchestrator.js
var DefaultDataOperationOrchestrator = class {
  _dataverseOperation;
  _connectorOperation;
  _connectionsService;
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  constructor(_dataverseOperation, _connectorOperation, _connectionsService) {
    this._dataverseOperation = _dataverseOperation;
    this._connectorOperation = _connectorOperation;
    this._connectionsService = _connectionsService;
  }
  /**
   * Creates a new record in the specified data source.
   * @param tableName - The name of the table.
   * @param data - The record data to create.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async createRecordAsync(tableName, data) {
    try {
      this._validateParams({ tableName, data });
      const executor = await this._getExecutor(tableName);
      return await executor.createRecordAsync(tableName, data);
    } catch (error) {
      return createErrorResponse(error, "Create record operation failed");
    }
  }
  /**
   * Updates an existing record in the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to update.
   * @param data - The updated record data.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async updateRecordAsync(tableName, id, data) {
    try {
      this._validateParams({ tableName, id, data });
      const executor = await this._getExecutor(tableName);
      return await executor.updateRecordAsync(tableName, id, data);
    } catch (error) {
      return createErrorResponse(error, "Update record operation failed");
    }
  }
  /**
   * Deletes a record from the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to delete.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async deleteRecordAsync(tableName, id) {
    try {
      this._validateParams({ tableName, id });
      const executor = await this._getExecutor(tableName);
      return await executor.deleteRecordAsync(tableName, id);
    } catch (error) {
      return createErrorResponse(error, "Delete record operation failed");
    }
  }
  /**
   * Retrieves a record from the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to retrieve.
   * @param options - Optional operation options.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async retrieveRecordAsync(tableName, id, options) {
    try {
      this._validateParams({ tableName, id });
      const executor = await this._getExecutor(tableName);
      this._validateOptions(options);
      return await executor.retrieveRecordAsync(tableName, id, options);
    } catch (error) {
      return createErrorResponse(error, "Retrieve record operation failed");
    }
  }
  /**
   * Retrieves multiple records from the specified data source.
   * @param tableName - The name of the table.
   * @param options - Optional operation options.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    try {
      this._validateParams({ tableName });
      const executor = await this._getExecutor(tableName);
      this._validateOptions(options);
      return await executor.retrieveMultipleRecordsAsync(tableName, options);
    } catch (error) {
      return createErrorResponse(error, "Retrieve multiple records operation failed");
    }
  }
  /**
   * Executes a data operation on the specified data source.
   * @param operation - The operation to execute
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async executeAsync(operation) {
    try {
      this._validateParams({ operation });
      const executor = await this._getExecutor("", operation.connectorOperation ? DataSources.Connector : DataSources.Dataverse);
      return await executor.executeAsync(operation);
    } catch (error) {
      return createErrorResponse(error, "Execute operation failed");
    }
  }
  /**
   * Retrieves the appropriate executor based on the data source.
   * @param dataSource - The data source to retrieve the executor for.
   * @returns The corresponding executor instance.
   * @throws DataOperationError if the data source is invalid.
   * // TODO: Add Dataverse support
   */
  async _getExecutor(tableName, dataSource) {
    const dataOperationExecutorOverride = getDataOperationExecutor();
    if (dataOperationExecutorOverride) {
      return dataOperationExecutorOverride;
    }
    const dataSourceType = dataSource || (await this._connectionsService.getDataSource(tableName)).dataSourceType;
    switch (dataSourceType) {
      case DataSources.Dataverse:
        return this._dataverseOperation;
      case DataSources.Connector:
        return this._connectorOperation;
      default:
        return this._connectorOperation;
    }
  }
  /**
   * Validates the input parameters for data operations.
   * @param params - The parameters to validate.
   * @throws DataOperationError if validation fails.
   */
  _validateParams(params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: ${key} is required`);
      }
    }
  }
  /**
   * Validates the operation options.
   * @param options - The operation options to validate.
   * @throws Error if validation fails.
   */
  _validateOptions(options) {
    if (!options) {
      return;
    }
    if (options.maxPageSize && typeof options.maxPageSize !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: maxPageSize must be a number`);
    }
    if (options.select) {
      if (!Array.isArray(options.select)) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: select must be an array of strings`);
      }
      if (options.select.some((s) => typeof s !== "string" || s.trim() === "")) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: select must contain only non-empty strings`);
      }
    }
    if (options.filter && typeof options.filter !== "string") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: filter must be a string`);
    }
    if (options.orderBy) {
      if (!Array.isArray(options.orderBy)) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: orderBy must be an array of strings`);
      }
      if (options.orderBy.some((s) => typeof s !== "string" || s.trim() === "")) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: orderBy must contain only non-empty strings`);
      }
    }
    if (options.top && typeof options.top !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: top must be a number`);
    }
    if (options.skip && typeof options.skip !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: skip must be a number`);
    }
    if (options.count && typeof options.count !== "boolean") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: count must be a boolean`);
    }
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/metadata/runtimeMetadataOperations.js
var RuntimeMetadataOperations = class {
  _clientProvider;
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  constructor(_clientProvider) {
    this._clientProvider = _clientProvider;
  }
  async getConnections(context) {
    const client = await this._clientProvider.getMetadataClientAsync();
    const response = await client.getAppConnectionConfigsAsync(context);
    return {
      success: response.success,
      data: response.data ? [response.data] : [],
      error: response.error
    };
  }
  async getConnectionApis(_connectionId, context) {
    const client = await this._clientProvider.getMetadataClientAsync();
    const response = await client.getAppDataSourceConfigsAsync(context);
    return {
      success: response.success,
      data: response.data ? [response.data] : [],
      error: response.error
    };
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/common/utils.js
function arrayBufferToBase64(buffer) {
  return window.btoa(convertArrayBufferToString(buffer));
}
function convertArrayBufferToString(buf) {
  if (buf.byteLength <= 65535) {
    return String.fromCharCode(...new Uint8Array(buf));
  }
  let binary = "";
  for (let i = 0, bytes = new Uint8Array(buf); i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}
function strictEncode(str) {
  return encodeURIComponent(str).replace(/\(/g, "%28").replace(/\)/g, "%29");
}
function extractDataverseUrlParts(url) {
  const baseUrlMatch = url.match(/^(https?:\/\/[^/]+\/api\/data\/v9\.0)/);
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : "";
  const pathMatch = url.match(/\/api\/data\/v9\.0\/(.+)$/);
  const encodedPath = pathMatch ? strictEncode(pathMatch[1]) : "";
  return { baseUrl, encodedPath };
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtimeClient/runtimeDataClient.js
var RuntimeDataClient = class _RuntimeDataClient {
  _powerOperationExecutor;
  // Static identifiers for services
  // Used to identify specific services within the PowerApps environment
  static SERVICES = {
    dataClient: "AppHttpClientPlugin",
    identityService: "AppIdentityServicePlugin"
  };
  // Static identifiers for service actions
  // Used to identify specific actions within the service
  // These actions are used to send HTTP requests and get access tokens
  static ACTIONS = {
    sendHttp: "sendHttpAsync",
    getToken: "getAppAccessTokenAsync",
    getDynamicToken: "getAppDynamicResourceAccessTokenAsync"
  };
  // Request source identifier for telemetry
  // Used to identify the source of the request in telemetry data
  static REQUEST_SOURCE = "PublishedApp";
  // Constructor for RuntimeDataClient
  // Accepts an IPowerOperationExecutor instance for executing operations
  constructor(_powerOperationExecutor) {
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  /**
   * Creates a new instance of RuntimeDataClient
   */
  static createInstanceAsync(powerOperationExecutor) {
    return Promise.resolve(new _RuntimeDataClient(powerOperationExecutor));
  }
  /**
   * Creates data using POST method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param body - The request body for the POST method
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the request body is invalid
   */
  async createDataAsync(url, apiId, tableName, body, context) {
    try {
      if (!body) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingRequestBody}`);
      }
      const config = {
        url,
        method: HttpMethod.POST,
        apiId,
        tableName,
        body: JSON.stringify(body)
      };
      context = this._ensureContext(context, "runtimeDataClient.createDataAsync");
      return await this._executeRequest(config, context);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.CreateFailed);
      }
    }
  }
  /**
   * Updates data using PATCH method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param body - The request body for the PATCH method
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the request body is invalid
   */
  async updateDataAsync(url, apiId, tableName, body, context) {
    try {
      if (!body) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingRequestBody}`);
      }
      const config = {
        url,
        method: HttpMethod.PATCH,
        apiId,
        tableName,
        body: JSON.stringify(body)
      };
      context = this._ensureContext(context, "runtimeDataClient.updateDataAsync");
      return await this._executeRequest(config, context);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.UpdateFailed);
      }
    }
  }
  /**
   * Deletes data using DELETE method
   * @param url - The URL for the request
   * @param connectionApi - The API ID for authentication
   * @param serviceNamespace - The name of the service namespace
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   */
  async deleteDataAsync(url, connectionApi, serviceNamespace, context) {
    try {
      const config = {
        url,
        method: HttpMethod.DELETE,
        apiId: connectionApi,
        tableName: serviceNamespace
      };
      context = this._ensureContext(context, "runtimeDataClient.deleteDataAsync");
      return await this._executeRequest(config, context);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.DeleteFailed);
      }
    }
  }
  /**
   * Retrieves data using GET or POST method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param method - The HTTP method
   * @param body - Optional request body for POST method
   * @param context - Optional operation context
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   */
  async retrieveDataAsync(url, apiId, tableName, method, headers, body, context) {
    try {
      const config = {
        url,
        method,
        apiId,
        tableName,
        headers,
        body: body ? typeof body === "string" ? body : JSON.stringify(body) : void 0
      };
      context = this._ensureContext(context, "runtimeDataClient.retrieveDataAsync");
      return await this._executeRequest(config, context);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.RetrieveFailed);
      }
    }
  }
  /**
   * Gets an access token for the specified API.
   * If the API is Dataverse, retrieves a dynamic resource token; otherwise, retrieves a standard appservice API token.
   * @param apiId - The API ID for authentication
   * @param datasetName - Optional dataset name for Dataverse
   * @returns Promise resolving to the access token
   * @throws Error if token acquisition fails
   */
  async _getAccessToken(apiId, datasetName) {
    try {
      let result;
      if (apiId === DataSources.Dataverse) {
        result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.identityService, _RuntimeDataClient.ACTIONS.getDynamicToken, [datasetName]);
      } else {
        result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.identityService, _RuntimeDataClient.ACTIONS.getToken, [apiId]);
      }
      return result.data;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.TokenAcquisitionFailed, getErrorMessage(error));
    }
  }
  // Merge Prefer headers for Dataverse batch payloads
  _mergePreferHeaders(configHeaders, method) {
    let preferHeader = "";
    if (configHeaders?.Prefer) {
      preferHeader += configHeaders.Prefer;
    }
    if (method === HttpMethod.POST || method === HttpMethod.PATCH) {
      const defaultPrefer = "return=representation,odata.include-annotations=*";
      if (preferHeader) {
        if (!preferHeader.includes("return=representation")) {
          preferHeader += (preferHeader ? "," : "") + defaultPrefer;
        }
      } else {
        preferHeader = defaultPrefer;
      }
    }
    return preferHeader;
  }
  /**
   * Creates headers for the HTTP request.
   * Combines default headers with any custom headers provided in the config.
   * Custom headers are optional and take precedence over default headers.
   * @param token - The access token for authentication
   * @param config - The HTTP request configuration
   * @return The headers for the request
   * @throws Error if header creation fails
   */
  _createHeaders(token, config, context) {
    const baseHeaders = {
      Accept: "application/json",
      "x-ms-protocol-semantics": "cdp",
      ServiceNamespace: config.tableName,
      Authorization: `paauth ${token}`,
      "x-ms-pa-client-custom-headers-options": '{"addCustomHeaders":true}',
      "x-ms-enable-selects": "true",
      "x-ms-pa-client-telemetry-options": `paclient-telemetry {"operationName":"${context?.operationName ?? "runtimeDataClient.executeRequest"}"}`,
      "x-ms-pa-client-telemetry-additional-data": `{"apiId":"${config.apiId}"}`
    };
    if (config.apiId === DataSources.Dataverse) {
      baseHeaders["x-ms-protocol-semantics"] = DataSources.Dataverse;
      baseHeaders.Authorization = `dynamicauth ${token}`;
      const { baseUrl, encodedPath } = extractDataverseUrlParts(config.url);
      const batchId = context?.batchId || "";
      const preferHeader = this._mergePreferHeaders(config.headers, config.method);
      baseHeaders.BatchInfo = JSON.stringify({
        baseUrl,
        encodedPath,
        headers: {
          Accept: "application/json",
          ...preferHeader ? { Prefer: preferHeader } : {},
          ...config.method === HttpMethod.POST || config.method === HttpMethod.PATCH ? { "Content-Type": "application/json" } : {}
        },
        batchId
      });
    }
    if (config.headers) {
      return { ...baseHeaders, ...config.headers };
    }
    return baseHeaders;
  }
  /**
   * Executes an HTTP request with the given configuration
   * @param config - The HTTP request configuration
   * @param context - Optional operation context
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the response content type is invalid
   */
  async _executeRequest(config, context) {
    const token = await this._getAccessToken(config.apiId, context?.datasetName);
    const headers = this._createHeaders(token, config, context);
    const requestBody = config.body ? new Blob([config.body], { type: "application/json" }) : "";
    let result;
    try {
      result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.dataClient, _RuntimeDataClient.ACTIONS.sendHttp, [
        {
          url: config.url,
          method: config.method,
          requestSource: _RuntimeDataClient.REQUEST_SOURCE,
          allowSessionStorage: true,
          returnDirectResponse: true,
          headers
        },
        requestBody,
        "arraybuffer"
      ]);
    } catch (error) {
      return {
        success: false,
        error: parseHttpPluginError(error),
        data: void 0
      };
    }
    const responseData = result.data;
    const responseHeaders = responseData[0].headers;
    const contentType = responseHeaders["Content-Type"];
    if (!contentType) {
      return {
        success: true,
        data: void 0
      };
    } else if (contentType.indexOf("application/json") !== -1) {
      const data = result.data[1];
      let text = this._decodeArrayBuffer(data);
      if (!text) {
        text = "{}";
      }
      const parsedResult = JSON.parse(text);
      if (context?.isDataVerseOperation || this._isDataverseCall(config.url)) {
        return {
          success: true,
          data: parsedResult
        };
      } else if (!context?.isExecuteAsync && "value" in parsedResult && Array.isArray(parsedResult.value)) {
        return {
          success: true,
          data: parsedResult.value
        };
      } else {
        return {
          success: true,
          data: parsedResult
        };
      }
    } else if (contentType.indexOf("image/") !== -1) {
      const buffer = result.data[1];
      if (buffer instanceof ArrayBuffer) {
        const value = arrayBufferToBase64(buffer);
        return {
          success: true,
          data: value
        };
      }
      return {
        success: true,
        data: buffer
      };
    } else {
      const buffer = result.data[1];
      if (buffer instanceof ArrayBuffer) {
        const value = convertArrayBufferToString(buffer);
        const status = responseData[0].status;
        const responseType = context?.responseInfo?.[status];
        if (responseType) {
          let parsedValue;
          try {
            parsedValue = JSON.parse(value);
          } catch (err) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          if (responseType.type === "array" && !Array.isArray(parsedValue)) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          if (responseType.type === "object" && (typeof parsedValue !== "object" || Array.isArray(parsedValue) || parsedValue === null)) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          return {
            success: true,
            data: parsedValue
          };
        } else {
          return {
            success: true,
            data: value
          };
        }
      }
      return {
        success: false,
        data: responseData,
        error: new Error(DataOperationErrorMessages.InvalidResponse)
      };
    }
  }
  _ensureContext(context, defaultOperationName) {
    if (!context) {
      context = {};
    }
    if (!context.operationName) {
      context.operationName = defaultOperationName;
    }
    return context;
  }
  /**
   * Checks if the given URL is a Dataverse API call
   * @param url - The URL to check
   * @returns True if the URL is a Dataverse API call, false otherwise
   */
  _isDataverseCall(url) {
    if (!url) {
      return false;
    }
    const urlLower = decodeURIComponent(url).toLowerCase();
    return urlLower.includes("/api/data/") && !urlLower.includes("/apim");
  }
  /**
   * Decodes ArrayBuffer to string, handling both browser and Node.js environments
   * @param buffer - The ArrayBuffer to decode
   * @returns The decoded string
   */
  _decodeArrayBuffer(buffer) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(buffer);
    }
    const uint8Array = new Uint8Array(buffer);
    const results = [];
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      results.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }
    try {
      return results.join("");
    } catch {
      return results.join("");
    }
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtimeClient/runtimeMetadataClient.js
var RuntimeMetadataClient = class _RuntimeMetadataClient {
  _powerOperationExecutor;
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  // These identifiers are used to execute operations through the PowerOperationExecutor
  // The services provide the functionality for the operations
  static SERVICES = {
    powerAppsClient: "AppPowerAppsClientPlugin"
  };
  // The actions define the specific operations to be performed
  static ACTIONS = {
    getConnectionConfigs: "loadAppConnectionsAsync_v2",
    getDataSourceConfigs: "getAppCdsDataSourceConfigsAsync"
  };
  // Private member for the PowerOperationExecutor
  // The PowerOperationExecutor is used to execute operations on the clients
  constructor(_powerOperationExecutor) {
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  /**
   * Creates a new instance of RuntimeMetadataClient
   * @param powerOperationExecutor - The powerOperationExecutor instance
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  static createInstanceAsync(powerOperationExecutor) {
    return Promise.resolve(new _RuntimeMetadataClient(powerOperationExecutor));
  }
  /**
   * Fetches app connection configurations
   * @returns Promise resolving to connection reference details
   * @throws Error if the operation fails
   */
  async getAppConnectionConfigsAsync() {
    try {
      const config = {
        service: _RuntimeMetadataClient.SERVICES.powerAppsClient,
        action: _RuntimeMetadataClient.ACTIONS.getConnectionConfigs,
        params: []
      };
      const result = await this._executeOperation(config);
      return { success: true, data: result };
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.ConnectionConfigFetchFailed, getErrorMessage(error));
    }
  }
  /**
   * Fetches app data source configurations
   * @returns Promise resolving to connection reference details
   * @throws Error if the operation fails
   */
  async getAppDataSourceConfigsAsync() {
    try {
      const config = {
        service: _RuntimeMetadataClient.SERVICES.powerAppsClient,
        action: _RuntimeMetadataClient.ACTIONS.getDataSourceConfigs,
        params: []
      };
      const result = await this._executeOperation(config);
      return { success: true, data: result };
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceConfigFetchFailed, getErrorMessage(error));
    }
  }
  /**
   * Executes a metadata operation with the given configuration
   * @param config - The operation configuration
   * @returns Promise resolving to the operation result
   * @throws Error if the operation fails
   */
  async _executeOperation(config) {
    try {
      const result = await this._powerOperationExecutor.execute(config.service, config.action, config.params || []);
      const lowerCaseResult = Object.keys(result.data).reduce((acc, key) => {
        acc[key.toLowerCase()] = (result.data ?? {})[key];
        return acc;
      }, {});
      return lowerCaseResult;
    } catch {
      throw new PowerDataRuntimeError(ErrorCodes.InvalidMetadataResponse);
    }
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtimeClient/runtimeClientProvider.js
var RuntimeClientProvider = class {
  // Private members for data and metadata clients
  // The data client is responsible for handling data operations
  _dataClient;
  // The metadata client is responsible for handling metadata operations
  _metadataClient;
  // The operation executor is used to execute operations on the clients
  // It is an instance of IPowerOperationExecutor, which provides the necessary methods for executing operations
  _operationExecutor;
  // Constructor for RuntimeClientProvider
  // Accepts an optional IPowerOperationExecutor instance for executing operations
  // If not provided, uses the default PowerOperationExecutor instance
  constructor(powerOperationExecutor) {
    this._operationExecutor = powerOperationExecutor;
  }
  /**
   * Gets or initializes the data client
   * @throws Error if client initialization fails
   * @returns Promise resolving to IRuntimeDataClient
   */
  async getDataClientAsync() {
    try {
      if (!this._dataClient) {
        this._dataClient = await this._initializeDataClient();
      }
      if (!this._dataClient) {
        throw new PowerDataRuntimeError(ErrorCodes.DataClientNotInitialized);
      }
      return this._dataClient;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, getErrorMessage(error));
    }
  }
  /**
   * Gets or initializes the metadata client
   * @throws Error if client initialization fails
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  async getMetadataClientAsync() {
    try {
      if (!this._metadataClient) {
        this._metadataClient = await this._initializeMetadataClient();
      }
      if (!this._metadataClient) {
        throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotInitialized);
      }
      return this._metadataClient;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientInitFailed, getErrorMessage(error));
    }
  }
  /**
   * Initializes the data client
   * @returns Promise resolving to IRuntimeDataClient
   */
  async _initializeDataClient() {
    return RuntimeDataClient.createInstanceAsync(this._operationExecutor);
  }
  /**
   * Initializes the metadata client
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  async _initializeMetadataClient() {
    return RuntimeMetadataClient.createInstanceAsync(this._operationExecutor);
  }
  /**
   * Resets both clients, forcing re-initialization on next use
   * Useful for testing or recovering from error states
   */
  reset() {
    this._dataClient = void 0;
    this._metadataClient = void 0;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/data/executors/shared/stringQueryOptions.js
function convertOptionsToQueryString(options) {
  if (!options) {
    return "";
  }
  const parts = [];
  if (options.select && options.select.length > 0) {
    parts.push(`$select=${encodeURIComponent(options.select.map((s) => s.trim().replace(/%20/g, "+").replace(/'/g, "%27")).join(","))}`);
  }
  if (options.filter) {
    const encodedFilter = encodeURIComponent(options.filter.trim()).replace(/%20/g, "+").replace(/'/g, "%27");
    parts.push(`$filter=${encodedFilter}`);
  }
  if (options.orderBy && options.orderBy.length > 0) {
    parts.push(`$orderby=${encodeURIComponent(options.orderBy.map((s) => s.trim().replace(/%20/g, "+").replace(/'/g, "%27")).join(","))}`);
  }
  if (options.top !== void 0 && options.top !== null) {
    parts.push(`$top=${options.top}`);
  }
  if (options.skip !== void 0 && options.skip !== null) {
    parts.push(`$skip=${options.skip}`);
  }
  if (options.count !== void 0 && options.count !== null) {
    parts.push(`$count=${options.count}`);
  }
  if (options.skipToken && options.skipToken.trim() !== "") {
    parts.push(`$skiptoken=${encodeURIComponent(options.skipToken.trim())}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/data/executors/dataverseDataOperationExecutor.js
var ODATA_NEXT_LINK = "@odata.nextLink";
var DataverseDataOperationExecutor = class {
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  _clientProvider;
  _databaseReferences;
  constructor(clientProvider) {
    this._clientProvider = clientProvider;
  }
  /**
   * Creates a new record in Dataverse
   * @param tableName - The name of the table
   * @param data - The record data to create
   * @returns Promise resolving to operation result
   */
  async createRecordAsync(tableName, data) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.createDataAsync(
        requestUrl,
        DataSources.Dataverse,
        // Use environment name for Dataverse authentication
        tableName,
        data,
        {
          operationName: DataverseOperationName.CreateRecord,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.CreateFailed);
  }
  /**
   * Updates an existing record in Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @param data - The updated record data
   * @returns Promise resolving to operation result
   */
  async updateRecordAsync(tableName, id, data) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.updateDataAsync(requestUrl, DataSources.Dataverse, tableName, data, {
        operationName: DataverseOperationName.UpdateRecord,
        datasetName: dataSourceInfo.datasetName,
        isDataVerseOperation: true
      });
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.UpdateFailed);
  }
  /**
   * Deletes a record from Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @returns Promise resolving to operation result
   */
  async deleteRecordAsync(tableName, id) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.deleteDataAsync(requestUrl, DataSources.Dataverse, tableName, {
        operationName: DataverseOperationName.DeleteRecord,
        datasetName: dataSourceInfo.datasetName,
        isDataVerseOperation: true
      });
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.DeleteFailed);
  }
  /**
   * Retrieves a single record from Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @param options - The retrieval options
   * @returns Promise resolving to operation result
   */
  async retrieveRecordAsync(tableName, id, options) {
    const { maxPageSize = 500, ...rest } = options || {};
    const optionsString = convertOptionsToQueryString(rest);
    const headers = { Prefer: `odata.maxpagesize=${maxPageSize},odata.include-annotations=*` };
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})${optionsString}`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.retrieveDataAsync(
        requestUrl,
        DataSources.Dataverse,
        tableName,
        HttpMethod.GET,
        headers,
        void 0,
        // No body for GET requests
        {
          operationName: DataverseOperationName.RetrieveRecord,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.RetrieveFailed);
  }
  /**
   * Retrieves multiple records from Dataverse
   * @param tableName - The name of the table
   * @param options - The retrieval options
   * @param maxPageSize - Optional maximum page size
   * @returns Promise resolving to operation result
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    const { maxPageSize = 500, ...rest } = options || {};
    const optionsString = convertOptionsToQueryString(rest);
    const headers = { Prefer: `odata.maxpagesize=${maxPageSize},odata.include-annotations=*` };
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, optionsString), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.retrieveDataAsync(
        requestUrl,
        DataSources.Dataverse,
        tableName,
        HttpMethod.GET,
        headers,
        void 0,
        // No body for GET requests
        {
          operationName: DataverseOperationName.RetrieveMultipleRecords,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse?.data?.value || [],
        skipToken: extractSkipToken(dataverseResponse?.data?.[ODATA_NEXT_LINK]),
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.RetrieveMultipleFailed);
  }
  /**
   * Executes a custom Dataverse operation
   * @param operation - The operation to execute
   * @returns Promise resolving to operation result
   */
  async executeAsync(operation) {
    const { dataverseRequest } = operation;
    if (!dataverseRequest) {
      return {
        success: false,
        data: null,
        error: { message: "Dataverse request details are required for Dataverse operations." }
      };
    }
    const { action, parameters } = dataverseRequest;
    switch (action) {
      // Future custom actions can be handled here
      case "getEntityMetadata":
        const { tableName, options } = parameters;
        if (!tableName) {
          return {
            success: false,
            data: null,
            error: { message: "Table name is required for getEntityMetadata action." }
          };
        }
        return this._getEntityMetadata(tableName, options ?? {});
      default:
        Log.trackEvent("DataverseDataOperation.UnsupportedAction", {
          message: `Unsupported Dataverse action: ${action}`
        });
        return {
          success: false,
          data: null,
          error: { message: `Unsupported Dataverse action: "${action}"` }
        };
    }
  }
  async _getEntityMetadata(tableName, options) {
    const client = await this._getDataClient();
    const dataSourceInfo = await this._getDataverseDataSourceInfo(tableName);
    const url = this._generateMetadataRequestUrl(dataSourceInfo, options);
    return client.retrieveDataAsync(url, DataSources.Dataverse, "EntityDefinitions", HttpMethod.GET, {
      Consistency: "Strong"
      // Force CDS to return latest metadata
    }, void 0, {
      operationName: DataverseOperationName.RetrieveRecord,
      datasetName: dataSourceInfo.datasetName,
      isDataVerseOperation: true
    });
  }
  /**
   * Returns the database references for Dataverse, grouped by environment/database.
   * These come from the launch app response via runtime metadata client.
   */
  async getDatabaseReferences() {
    if (this._databaseReferences) {
      return this._databaseReferences;
    }
    const runtimeDatabaseReferences = await this._loadDatabaseReferencesFromRuntime();
    if (runtimeDatabaseReferences && Object.keys(runtimeDatabaseReferences).length > 0) {
      this._databaseReferences = runtimeDatabaseReferences;
      return this._databaseReferences;
    }
    throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, "Failed to load Dataverse database references from runtime.");
  }
  /**
   * Loads database references from runtime metadata client (launch app response).
   */
  async _loadDatabaseReferencesFromRuntime() {
    try {
      const metadataClient = await this._getMetadataClient();
      const response = await metadataClient.getAppDataSourceConfigsAsync();
      if (!response.success || !response.data) {
        return void 0;
      }
      const cdsDataSources = Object.values(response.data);
      if (cdsDataSources.length === 0) {
        return void 0;
      }
      const databaseReferences = {};
      for (const cdsDataSource of cdsDataSources) {
        const cdsConfig = cdsDataSource;
        const instanceUrl = this._extractInstanceUrlFromRuntimeUrl(cdsConfig.runtimeUrl);
        const envName = "default.cds";
        if (!databaseReferences[envName]) {
          databaseReferences[envName] = {
            databaseDetails: {
              referenceType: "Environmental",
              environmentName: envName,
              overrideValues: {
                status: "NotSpecified",
                environmentVariableName: ""
              },
              linkedEnvironmentMetadata: {
                resourceId: "",
                friendlyName: "",
                uniqueName: "",
                domainName: "",
                version: cdsConfig.version || "9.2",
                instanceUrl,
                instanceApiUrl: cdsConfig.runtimeUrl,
                baseLanguage: 1033,
                instanceState: "Ready",
                createdTime: "",
                platformSku: ""
              }
            },
            dataSources: {}
          };
        }
        const dataSourceName = cdsConfig.entitySetName || cdsConfig.logicalName;
        databaseReferences[envName].dataSources[dataSourceName] = {
          entitySetName: cdsConfig.entitySetName,
          logicalName: cdsConfig.logicalName,
          isHidden: false
        };
      }
      return databaseReferences;
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.FailedToLoadDatabaseReferences", {
        message: "[DataverseDataOperation] Failed to load database references from runtime",
        error
      });
      return void 0;
    }
  }
  _extractInstanceUrlFromRuntimeUrl(runtimeUrl) {
    try {
      const matches = runtimeUrl.match(/^(https?:\/\/[^\/]+)/);
      return matches ? matches[1] : runtimeUrl;
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.FailedToExtractInstanceUrl", {
        message: "[DataverseDataOperation] Failed to extract instance URL from runtime URL",
        error
      });
      return runtimeUrl;
    }
  }
  /**
   * Helper to get a native data client and database reference
   */
  async _getDataClient() {
    const dataClient = await this._clientProvider.getDataClientAsync();
    if (!dataClient) {
      Log.trackEvent("DataverseDataOperation.DataClientNotAvailable", {
        message: "[DataverseDataOperation] Data client is not available"
      });
      throw new PowerDataRuntimeError(ErrorCodes.DataClientNotAvailable, "Data client is not available.");
    }
    return dataClient;
  }
  /**
   * Gets the metadata client instance
   */
  async _getMetadataClient() {
    const metadataClient = await this._clientProvider.getMetadataClientAsync();
    if (!metadataClient) {
      Log.trackEvent("DataverseDataOperation.MetadataClientNotAvailable", {
        message: "[DataverseDataOperation] Metadata client is not available"
      });
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotAvailable);
    }
    return metadataClient;
  }
  /**
   * Template method for connector-style CRUD operations to reduce duplication.
   * Handles client, dataSourceInfo, requestUrl, and error handling.
   */
  async _executeNativeDataverseOperation(tableName, buildUrl, operation, errorMessage) {
    try {
      const dataClient = await this._getDataClient();
      const dataSourceInfo = await this._getDataverseDataSourceInfo(tableName);
      const requestUrl = buildUrl(dataSourceInfo, tableName);
      return operation(dataClient, requestUrl, dataSourceInfo);
    } catch (error) {
      return createErrorResponse(error, errorMessage);
    }
  }
  /**
   * Helper to get the Dataverse datasourceinfo from databaseReferences
   */
  async _getDataverseDataSourceInfo(tableName) {
    try {
      const dbRefs = await this.getDatabaseReferences();
      for (const dbKey of Object.keys(dbRefs)) {
        const db = dbRefs[dbKey];
        if (db.dataSources[tableName]) {
          const ds = db.dataSources[tableName];
          return {
            datasetName: db.databaseDetails?.environmentName,
            referenceType: db.databaseDetails?.referenceType,
            linkedEnvironmentMetadata: db.databaseDetails?.linkedEnvironmentMetadata,
            entitySetName: ds?.entitySetName,
            logicalName: ds?.logicalName,
            isHidden: ds?.isHidden,
            tableId: ds?.logicalName,
            apis: {}
          };
        }
      }
      const notFoundMsg = `No Dataverse data source found for table: ${tableName}`;
      Log.trackEvent("DataverseDataOperation.DataSourceNotFound", {
        message: notFoundMsg,
        tableName
      });
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, notFoundMsg);
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.GetDataSourceInfoFailed", {
        message: "[DataverseDataOperation] Failed to get Dataverse data source info",
        tableName,
        error
      });
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, `Failed to get Dataverse data source info for table '${tableName}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Helper to construct the Dataverse API URL using instanceUrl if available, otherwise fallback to runtimeUrl.
   */
  _getInstanceUrl(dataSourceInfo) {
    const instanceUrl = dataSourceInfo.linkedEnvironmentMetadata?.instanceUrl;
    if (!instanceUrl) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, "No instanceUrl found for Dataverse table.");
    }
    const baseUrl = instanceUrl.endsWith("/") ? instanceUrl : `${instanceUrl}/`;
    return baseUrl;
  }
  /**
   * Helper to construct the Dataverse API URL using instanceUrl if available, otherwise fallback to runtimeUrl.
   */
  _getDataverseRequestUrl(dataSourceInfo, tableName, urlPath = "") {
    const baseUrl = this._getInstanceUrl(dataSourceInfo);
    return `${baseUrl}api/data/v9.0/${tableName}${urlPath}`;
  }
  /**
   * Constructs GET request URL for fetching metadata using options object.
   * @param dataSourceInfo - The data source information for the Dataverse table.
   * @param options - The options for the metadata request.
   * @returns The constructed metadata request URL.
   */
  _generateMetadataRequestUrl(dataSourceInfo, options) {
    const { logicalName } = dataSourceInfo;
    if (!logicalName) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, "No logicalName found for Dataverse table.");
    }
    const url = new URL(`${this._getInstanceUrl(dataSourceInfo)}api/data/v9.0/EntityDefinitions(LogicalName='${logicalName}')`);
    const { metadata, schema } = options;
    const selects = new Set(Array.isArray(metadata) ? metadata : []);
    selects.add("LogicalName");
    const expands = [];
    if (schema?.manyToOne) {
      expands.push("ManyToOneRelationships");
    }
    if (schema?.oneToMany) {
      expands.push("OneToManyRelationships");
    }
    if (schema?.manyToMany) {
      expands.push("ManyToManyRelationships");
    }
    if (schema?.columns === "all") {
      expands.push("Attributes");
    } else if (schema && Array.isArray(schema.columns) && schema.columns.length > 0) {
      const attributesCollection = schema.columns.map((a) => `'${a}'`).join(",");
      expands.push(`Attributes($filter=Microsoft.Dynamics.CRM.In(PropertyName='LogicalName',PropertyValues=[${attributesCollection}]))`);
    }
    url.search = new URLSearchParams({
      $select: [...selects].join(","),
      $expand: expands.join(",")
    }).toString();
    return url.toString();
  }
};
function extractSkipToken(nextLink) {
  if (!nextLink?.trim()) {
    return void 0;
  }
  const match = nextLink.match(/[\?&]\$?skiptoken=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : void 0;
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/data/executors/connectorDataOperationExecutor.js
var ConnectorDataOperationExecutor = class {
  // =====================================
  // Private Members
  // =====================================
  _clientProvider;
  _connectionsService;
  _databaseReferences;
  _connectionReferences;
  // =====================================
  // Constructor
  // =====================================
  constructor(clientProvider, connectionsService) {
    this._validateConstructorParams(clientProvider, connectionsService);
    this._clientProvider = clientProvider;
    this._connectionsService = connectionsService;
  }
  // =====================================
  // Public Methods
  // =====================================
  /**
   * Creates a new record in the specified table
   */
  async createRecordAsync(tableName, data) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference);
      const result = await dataClient.createDataAsync(requestUrl, connectionReference.apiId, tableName, data, { operationName: ConnectorOperationName.CreateRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.CreateFailed);
    }
  }
  /**
   * Updates an existing record in the specified table
   */
  async updateRecordAsync(tableName, id, data) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}`);
      const result = await dataClient.updateDataAsync(requestUrl, connectionReference.apiId, tableName, data, { operationName: ConnectorOperationName.UpdateRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.UpdateFailed);
    }
  }
  /**
   * Deletes a record from the specified table
   */
  async deleteRecordAsync(tableName, id) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}`);
      const result = await dataClient.deleteDataAsync(requestUrl, connectionReference.apiId, tableName, { operationName: ConnectorOperationName.DeleteRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.DeleteFailed);
    }
  }
  /**
   * Retrieves a single record from the specified table
   */
  async retrieveRecordAsync(tableName, id, options) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}${convertOptionsToQueryString(options)}`);
      const result = await dataClient.retrieveDataAsync(
        requestUrl,
        connectionReference.apiId,
        tableName,
        HttpMethod.GET,
        void 0,
        // body
        { operationName: ConnectorOperationName.RetrieveRecord }
      );
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.RetrieveFailed);
    }
  }
  /**
   * Retrieves multiple records from the specified table
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, convertOptionsToQueryString(options), false);
      const result = await dataClient.retrieveDataAsync(
        requestUrl,
        connectionReference.apiId,
        tableName,
        HttpMethod.GET,
        void 0,
        // body
        { operationName: ConnectorOperationName.RetrieveMultipleRecords }
      );
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.RetrieveMultipleFailed);
    }
  }
  /**
   * Executes a custom operation on the data source
   */
  async executeAsync(operation) {
    try {
      if (!operation?.connectorOperation) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingConnectorOperation}`);
      }
      const tableName = operation.connectorOperation.tableName;
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const config = await this._getOperationConfig(operation, connectionReference, tableName);
      const requestUrl = await this._buildOperationUrl(operation, config);
      const bodyParam = await this._buildOperationBody(operation, tableName);
      const headers = await this._buildOperationHeader(operation, tableName);
      const httpMethod = this._getHttpMethod(requestUrl, dataSourceInfo, operation.connectorOperation.operationName);
      const responseInfo = dataSourceInfo.apis[operation.connectorOperation.operationName]?.responseInfo;
      const result = await dataClient.retrieveDataAsync(requestUrl, config.apiId, tableName, httpMethod, headers, bodyParam, {
        isExecuteAsync: true,
        // Use the connector operation name for telemetry, may be a better idea to use executeAsync
        // here and just log the connector operation name in the custom dimensions leaving comment for PR.
        operationName: `connectorDataOperation.${operation.connectorOperation.operationName}`,
        responseInfo
      });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.ExecuteFailed);
    }
  }
  // =====================================
  // Private Methods
  // =====================================
  /**
   * Determines the appropriate HTTP method for a request
   * @param requestUrl - The URL for the request
   * @param dataSourceInfo - The data source information
   * @param operation - The operation name
   * @returns The HTTP method to use
   */
  _getHttpMethod(requestUrl, dataSourceInfo, operation) {
    const isSqlStoredProcedure = requestUrl.indexOf("apim/sql") > -1;
    if (isSqlStoredProcedure) {
      return HttpMethod.POST;
    }
    const method = dataSourceInfo.apis[operation]?.method;
    if (method) {
      return method;
    }
    return HttpMethod.GET;
  }
  /**
   * Builds the operation body parameters
   */
  async _buildOperationBody(operation, tableName) {
    const operationName = operation?.connectorOperation?.operationName;
    if (operationName) {
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const hasBodyParameter = dataSourceInfo?.apis?.[operationName]?.parameters?.some((param) => param.in === "body");
      if (hasBodyParameter) {
        return await this._buildOperationBodyParam(operation, tableName);
      }
    }
    return void 0;
  }
  /**
   * Builds operation body parameters from the operation and data source info
   */
  async _buildOperationBodyParam(operation, tableName) {
    const operationName = operation.connectorOperation?.operationName;
    if (!operationName) {
      return "{}";
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const apiParams = dataSourceInfo?.apis?.[operationName]?.parameters || [];
    const rawParams = operation.connectorOperation?.parameters || [];
    let bodyValue = {};
    apiParams.forEach((param, index) => {
      if (typeof rawParams === "object" && rawParams !== null) {
        if (apiParams[index].in === "body") {
          const value = rawParams[param.name];
          if (param.name === "body") {
            bodyValue = value;
            return;
          }
          if (value !== void 0 && value !== null) {
            bodyValue[param.name] = value;
          }
        }
      }
    });
    return JSON.stringify(bodyValue);
  }
  /**
   * Builds the operation header for a given data operation if required.
   *
   * @template TRequest - The type of the request payload for the data operation.
   * @param dataOperationRequest - The data operation containing details about the connector operation.
   * @param tableName - The name of the table associated with the data operation.
   * @returns A promise that resolves to the operation header as a string if a header parameter is required,
   *          or `undefined` if no header parameter is needed.
   */
  async _buildOperationHeader(dataOperationRequest, tableName) {
    const operationName = dataOperationRequest.connectorOperation?.operationName;
    if (operationName) {
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const hasHeaderParameter = dataSourceInfo?.apis?.[operationName]?.parameters?.some((param) => param.in === "header");
      if (hasHeaderParameter) {
        return await this._buildOperationHeaderParam(dataOperationRequest, tableName);
      }
    }
    return void 0;
  }
  /**
   * Builds the operation header parameters as a JSON string for a given data operation.
   *
   * @template TRequest - The type of the request object for the data operation.
   * @param dataOperationRequest - The data operation containing connector operation details and parameters.
   * @param tableName - The name of the table associated with the data operation.
   * @returns A promise that resolves to a JSON string representing the header parameters,
   *          or `undefined` if no `header` parameters are available.
   */
  async _buildOperationHeaderParam(dataOperationRequest, tableName) {
    const operationName = dataOperationRequest.connectorOperation?.operationName;
    if (!operationName) {
      return {};
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const apiParamSpec = dataSourceInfo?.apis?.[operationName]?.parameters || [];
    const inputParams = dataOperationRequest.connectorOperation?.parameters;
    const headers = {};
    if (!inputParams) {
      return void 0;
    }
    if (typeof inputParams === "string") {
      if (apiParamSpec.length === 1 && apiParamSpec[0].in === "header") {
        headers[apiParamSpec[0].name] = inputParams;
      }
    }
    if (typeof inputParams === "object" && !Array.isArray(inputParams)) {
      apiParamSpec.forEach((param) => {
        if (param.in === "header" && param.name in inputParams) {
          headers[param.name] = inputParams[param.name];
        }
      });
    }
    if (Array.isArray(inputParams)) {
      apiParamSpec.forEach((param, index) => {
        if (param.in === "header" && inputParams[index] !== void 0) {
          headers[param.name] = inputParams[index];
        }
      });
    }
    return headers;
  }
  /**
   * Constructs the request URL for table operations
   * @param tableName - The name of the table
   * @param connectionReference - The connection reference
   * @param options - Optional URL parameters
   * @param encodeOptions - Whether to encode the options
   * @returns The constructed URL
   */
  async _buildTableUrl(tableName, connectionReference, options = "", encodeOptions = true) {
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const isSharedSql = (connectionReference.apiId ?? "").indexOf("shared_sql") > -1;
    const isSharePoint = (connectionReference.apiId ?? "").indexOf("shared_sharepointonline") > -1;
    const urlBuilder = {
      runtimeUrl: connectionReference.runtimeUrl ?? "",
      connectionName: connectionReference.connectionName ?? "",
      datasetName: connectionReference.datasetName ? isSharedSql ? connectionReference.datasetNameOverride : isSharePoint ? encodeURIComponent(encodeURIComponent(connectionReference.datasetName)) : encodeURIComponent(connectionReference.datasetName) : "",
      tableId: isSharedSql ? encodeURIComponent(encodeURIComponent(dataSourceInfo.tableId)) : dataSourceInfo.tableId,
      version: dataSourceInfo.version,
      isSharedSql
    };
    return this._constructUrl(urlBuilder, options, encodeOptions);
  }
  /**
   * Builds the operation URL
   */
  async _buildOperationUrl(operation, config) {
    const operationName = operation.connectorOperation?.operationName;
    if (!operationName) {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: ${DataOperationErrorMessages.MissingOperationName}`);
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(config.tableName);
    const isSharedSql = (config.apiId ?? "").indexOf("shared_sql") > -1;
    const path = dataSourceInfo.apis[operationName].path;
    if (isSharedSql) {
      return this._buildSharedSqlOperationUrl(config, path);
    }
    return this._buildStandardOperationUrl(operation, config, operationName, path);
  }
  /**
   * Gets the connection references
   */
  async _getConnectionReferencesAsync() {
    if (this._connectionReferences) {
      return this._connectionReferences;
    }
    const metadataClient = await this._getMetadataClient();
    const response = await metadataClient.getAppConnectionConfigsAsync();
    this._connectionReferences = response.data;
    return this._connectionReferences;
  }
  /**
   * Gets the database references
   */
  async _getDatabaseReferencesAsync() {
    if (this._databaseReferences) {
      return this._databaseReferences;
    }
    const metadataClient = await this._getMetadataClient();
    const response = await metadataClient.getAppDataSourceConfigsAsync();
    this._databaseReferences = response.data;
    return this._databaseReferences;
  }
  /**
   * Gets the metadata client instance
   */
  async _getMetadataClient() {
    const metadataClient = await this._clientProvider.getMetadataClientAsync();
    if (!metadataClient) {
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotAvailable);
    }
    return metadataClient;
  }
  /**
   * Gets the connection reference for a table
   */
  _getConnectionReference(tableName) {
    const connectionReference = this._connectionReferences?.[tableName];
    if (!connectionReference) {
      throw new PowerDataRuntimeError(ErrorCodes.ConnectionReferenceNotFound, tableName);
    }
    return connectionReference;
  }
  /**
   * Gets both the data client and connection reference
   */
  async _getClientsAndConnection(tableName) {
    await this._getReferences();
    const dataClient = await this._clientProvider.getDataClientAsync();
    if (!dataClient) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientNotAvailable);
    }
    const connectionReference = this._getConnectionReference(tableName);
    return { dataClient, connectionReference };
  }
  /**
   * Builds the URL for shared SQL operations
   */
  _buildSharedSqlOperationUrl(config, path) {
    const version = config.version ? `/${config.version}/` : "/";
    return `${config.runtimeUrl}/${config.connectionName}${version}datasets/${config.datasetName}/procedures${path}`;
  }
  /**
   * Builds the URL for standard operations
   * Assumptions / Invariants:
   *  - The connector always defines a required path parameter for the connection id named 'connectionId'.
   *  - When a dataset is applicable, the parameter name is 'dataset'.
   *  - When a table is applicable, the parameter name is 'tableName'.
   *  - A lone string parameter maps to the first remaining (non-synthetic) required API parameter.
   *  - Array parameters map positionally to the remaining API parameters after filtering.
   *  - Object parameters map by (case-insensitive, hyphen/underscore agnostic) key.
   * @param operation - The data operation containing connector operation details from runtime
   * @param config - The connector operation configuration
   * @param operationName - The name of the operation to be performed
   * @param path - The path template for the operation
   */
  async _buildStandardOperationUrl(operation, config, operationName, path) {
    const dataSourceInfo = await this._connectionsService.getDataSource(config.tableName);
    let apiParams = dataSourceInfo.apis[operationName]?.parameters || [];
    if (apiParams.length > 0) {
      apiParams = apiParams.filter((param) => param.name !== "connectionId" && param.name !== "dataset" && param.name !== "tableName");
    }
    const operationParams = operation.connectorOperation?.parameters;
    const rawParamValues = {
      connectionId: config.connectionName,
      dataset: (
        // The dataset name needs to be double encoded for sharepoint, once here and then once in the HTTP pipeline
        // CRUD operations already handle this, so we need to do the same here
        config.apiId.indexOf("shared_sharepointonline") !== -1 && config.datasetName ? encodeURIComponent(config.datasetName) : config.datasetName
      ),
      tableName: config.tableName
    };
    if (operationParams !== void 0) {
      if (typeof operationParams === "string") {
        if (apiParams.length > 0) {
          const requiredParams = apiParams.filter((param) => param.required);
          rawParamValues[requiredParams?.[0]?.name ?? apiParams[0].name] = operationParams;
        }
      } else if (typeof operationParams === "object" && !Array.isArray(operationParams)) {
        apiParams.forEach((param) => {
          if (operationParams) {
            const value = this._getNormalizedParamValue(operationParams, param.name);
            if (value !== void 0) {
              rawParamValues[param.name] = value;
            }
          }
        });
      } else if (Array.isArray(operationParams)) {
        apiParams.forEach((param, index) => {
          rawParamValues[param.name] = operationParams[index];
        });
      }
    }
    const { processedPath, queryParams } = this._processParameters(
      // deliberately pass the unfiltered list to _processParameters so path placeholders still see synthetic params.
      dataSourceInfo.apis[operationName]?.parameters || [],
      rawParamValues,
      path
    );
    const separator = queryParams ? processedPath.includes("?") ? "&" : "?" : "";
    return `${config.runtimeUrl}${processedPath}${separator}${queryParams}`;
  }
  /**
   * Normalizes the parameter name by replacing hyphens with underscores and performs case-insensitive matching
   */
  _getNormalizedParamValue(obj, paramName) {
    const normalizedParamName = paramName.replace(/-/g, "_").toLowerCase();
    const foundKey = Object.keys(obj).find((key) => key.replace(/-/g, "_").toLowerCase() === normalizedParamName);
    return foundKey !== void 0 ? obj[foundKey] : void 0;
  }
  /**
   * Processes operation parameters into path and query parameters
   * @param apiParams - The API parameter specifications from the data source info
   * @param rawParamValues - The raw parameter values provided in the operation at runtime
   * @param path - The initial path template
   * @returns An object containing the processed path and query parameters
   */
  _processParameters(apiParams, rawParamValues, path) {
    const usedParams = /* @__PURE__ */ new Set();
    let processedPath = path;
    const queryParams = [];
    apiParams.forEach((param, index) => {
      const paramValue = rawParamValues[param.name];
      if (paramValue === void 0) {
        return;
      }
      if (param.in === "path") {
        const placeholder = `{${param.name}}`;
        if (processedPath.includes(placeholder)) {
          processedPath = processedPath.replace(placeholder, encodeURIComponent(String(paramValue)));
          usedParams.add(param.name);
        }
      } else if (param.in === "query") {
        queryParams.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(String(paramValue))}`);
        usedParams.add(param.name);
      }
    });
    return {
      processedPath,
      queryParams: queryParams.join("&")
    };
  }
  /**
   * Gets the operation configuration
   */
  async _getOperationConfig(operation, connectionReference, tableName) {
    if (!operation.connectorOperation) {
      throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingConnectorOperation}`);
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const config = {
      tableName,
      apiId: connectionReference.apiId ?? "",
      runtimeUrl: connectionReference.runtimeUrl ?? "",
      connectionName: connectionReference.connectionName ?? "",
      datasetName: connectionReference.datasetName ?? "",
      tableId: dataSourceInfo.tableId,
      version: dataSourceInfo.version
    };
    return config;
  }
  /**
   * Initializes the clients
   */
  async _getReferences() {
    await this._getConnectionReferencesAsync();
    await this._getDatabaseReferencesAsync();
  }
  /**
   * Validates constructor parameters
   */
  _validateConstructorParams(clientProvider, connectionsService) {
    if (!clientProvider) {
      throw new PowerDataRuntimeError(ErrorCodes.ClientProviderNotAvailable);
    }
    if (!connectionsService) {
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceServiceNotAvailable);
    }
  }
  /**
   * Constructs the final URL
   */
  _constructUrl(urlBuilder, options = "", encodeOptions = true) {
    const apiVersion = urlBuilder.version ? `/${urlBuilder.version}/` : "/";
    const encodedOptions = encodeOptions && options ? options.charAt(0) + encodeURIComponent(options.slice(1)) : options;
    if (urlBuilder.datasetName) {
      return `${urlBuilder.runtimeUrl}/${urlBuilder.connectionName}${apiVersion}datasets/${urlBuilder.datasetName}/tables/${urlBuilder.tableId}/items${encodedOptions}`;
    }
    return `${urlBuilder.runtimeUrl}/${urlBuilder.connectionName}/tables/${urlBuilder.tableId}/items${encodedOptions}`;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/metadata/runtimeDataSourceService.js
var DataSourceServiceError;
/* @__PURE__ */ (function(DataSourceServiceError2) {
})(DataSourceServiceError || (DataSourceServiceError = {}));
var RuntimeDataSourceService = class {
  _powerDataSourcesInfoProvider;
  /**
   * Data source information
   */
  _dataSourcesInfo;
  /**
   * Indicates whether the service has been initialized
   */
  _isInitialized;
  /**
   * Creates a new instance of RuntimeDataSourceService
   */
  constructor(_powerDataSourcesInfoProvider) {
    this._powerDataSourcesInfoProvider = _powerDataSourcesInfoProvider;
    this._dataSourcesInfo = {};
    this._isInitialized = false;
  }
  /**
   * Initializes the service by loading user data sources
   * @throws PowerDataRuntimeError if initialization fails
   */
  async initialize() {
    try {
      const userDataSources = await this._getUserDataSources();
      this._dataSourcesInfo = {};
      Object.keys(userDataSources).forEach((key) => {
        this._dataSourcesInfo[key] = userDataSources[key];
      });
      this._isInitialized = true;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.InitializationError, getErrorMessage(error));
    }
  }
  /**
   * Gets all user data sources
   * @returns Array of data source information
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async getUserDataSources() {
    await this._ensureInitialized();
    return this._dataSourcesInfo;
  }
  /**
   * Gets information for a specific data source
   * @param dataSource - The ID of the data source
   * @returns Data source information
   * @throws PowerDataRuntimeError if data source is not found or service is not initialized
   */
  async getDataSource(dataSource) {
    await this._ensureInitialized();
    const dataSourceInfo = this._dataSourcesInfo[dataSource];
    if (!dataSourceInfo) {
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, dataSource);
    }
    return dataSourceInfo;
  }
  /**
   * Checks if a data source exists
   * @param dataSourceId - The ID of the data source to check
   * @returns True if the data source exists, false otherwise
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async hasDataSource(dataSource) {
    await this._ensureInitialized();
    return dataSource in this._dataSourcesInfo;
  }
  /**
   * Ensures the service is initialized
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async _ensureInitialized() {
    if (!this._isInitialized) {
      await this.initialize();
    }
  }
  /**
   * Gets user data sources from the provided data source schemas
   * @returns Promise resolving to array of data source information
   */
  async _getUserDataSources() {
    const dataSourcesInfo = await this._powerDataSourcesInfoProvider.getDataSourcesInfo();
    return Promise.resolve(dataSourcesInfo);
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtime/powerDataRuntime.js
var PowerDataRuntime = class {
  _clientProvider;
  _dataSourceService;
  _dataOperations;
  _metadataOperations;
  _isInitialized;
  /**
   * Creates a new instance of PowerDataRuntime
   * @param params - Initialization parameters
   * @throws DataRuntimeError if initialization fails
   */
  constructor(params) {
    try {
      Log.createInstance(params.powerOperationExecutor);
      this._clientProvider = new RuntimeClientProvider(params.powerOperationExecutor);
      this._dataSourceService = new RuntimeDataSourceService(params.powerDataSourcesInfoProvider);
      this._isInitialized = false;
      this._initialize();
    } catch (error) {
      if (error instanceof Error) {
        Log.trackException(error);
      }
      throw error;
    }
  }
  /**
   * Gets the Data operations interface
   * @throws PowerDataRuntimeError if operations are not initialized
   */
  get Data() {
    this._ensureInitialized();
    if (!this._dataOperations) {
      this._dataOperations = this._createDataOperations();
    }
    return this._dataOperations;
  }
  /**
   * Gets the Metadata operations interface
   * @throws PowerDataRuntimeError if operations are not initialized
   */
  get Metadata() {
    this._ensureInitialized();
    if (!this._metadataOperations) {
      this._metadataOperations = this._createMetadataOperations();
    }
    return this._metadataOperations;
  }
  /**
   * Ensures the PowerDataRuntime is initialized
   * @throws PowerDataRuntimeError if not initialized
   */
  _ensureInitialized() {
    if (!this._isInitialized) {
      throw new PowerDataRuntimeError(ErrorCodes.OperationsNotInitialized);
    }
  }
  /**
   * Initializes the PowerDataRuntime components
   * @throws PowerDataRuntimeError if initialization fails
   */
  _initialize() {
    try {
      this._dataOperations = this._createDataOperations();
      this._metadataOperations = this._createMetadataOperations();
      this._isInitialized = true;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.InitializationFailed, getErrorMessage(error));
    }
  }
  /**
   * Creates a new instance of DataOperations
   */
  _createDataOperations() {
    const dataverseOperation = new DataverseDataOperationExecutor(this._clientProvider);
    const connectorOperation = new ConnectorDataOperationExecutor(this._clientProvider, this._dataSourceService);
    return new DefaultDataOperationOrchestrator(dataverseOperation, connectorOperation, this._dataSourceService);
  }
  /**
   * Creates a new instance of MetadataOperations
   */
  _createMetadataOperations() {
    return new RuntimeMetadataOperations(this._clientProvider);
  }
};

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtime/powerDataRuntimeInstance.js
var powerDataRuntimeInstance;
function getPowerDataRuntime(powerDataSourcesInfoProvider, powerOperationExecutor) {
  if (!powerDataRuntimeInstance) {
    powerDataRuntimeInstance = new PowerDataRuntime({
      powerDataSourcesInfoProvider,
      powerOperationExecutor
    });
  }
  return powerDataRuntimeInstance;
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtime/powerDataSourcesInfoProvider.js
var PowerDataSourcesInfoProvider = class _PowerDataSourcesInfoProvider {
  static instance = null;
  dataSourcesInfo;
  /**
   * Private constructor to enforce the singleton pattern.
   * @param dataSourcesInfo The data sources information to initialize the provider with.
   */
  constructor(dataSourcesInfo) {
    this.dataSourcesInfo = dataSourcesInfo;
  }
  /**
   * Retrieves the singleton instance of PowerDataSourcesInfoProvider.
   * If the instance does not exist, it initializes it with the provided data sources info.
   *
   * @param dataSourcesInfo Optional parameter to initialize the instance if it doesn't exist.
   * @returns The singleton instance of PowerDataSourcesInfoProvider.
   * @throws Error if the instance is not initialized and no dataSourcesInfo is provided.
   */
  static getInstance(dataSourcesInfo) {
    if (!this.instance) {
      if (!dataSourcesInfo) {
        throw new PowerDataRuntimeError(ErrorCodes.DataSourcesInfoNotFound);
      }
      this.instance = new _PowerDataSourcesInfoProvider(dataSourcesInfo);
    }
    return this.instance;
  }
  /**
   * Retrieves the data sources information.
   *
   * @returns A promise resolving to the data sources information.
   */
  async getDataSourcesInfo() {
    return this.dataSourcesInfo;
  }
};
var powerDataSourcesInfoProvider_default = PowerDataSourcesInfoProvider;

// node_modules/@microsoft/power-apps/lib/internal/communication/IncompatibleMessageReceiver.js
var IncompatibleMessageReceiver = class {
  versionInfo;
  incompatibilityDescription;
  isCompatible = false;
  constructor(versionInfo, incompatibilityDescription) {
    this.versionInfo = versionInfo;
    this.incompatibilityDescription = incompatibilityDescription;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/communication/SendMessageOperation.js
var SendMessageOperation = class {
  resultPromise;
  sendUpdate;
  /**
   * When completed is false onMessageReceived and sendUpdate will be visible.
   * When completed is true then these are hidden.
   */
  completed = false;
  onMessageReceived = void 0;
  constructor(resultPromise, sendUpdate) {
    this.resultPromise = resultPromise;
    this.sendUpdate = sendUpdate;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/communication/CompatibleMessageReceiver.js
var CompatibleMessageReceiver = class {
  _receiverName;
  versionInfo;
  isCompatible = true;
  constructor(_receiverName, versionInfo) {
    this._receiverName = _receiverName;
    this.versionInfo = versionInfo;
  }
  async sendMessage(message, onMessageReceived) {
    let resolveOperationPromise;
    let rejectOperationPromise;
    const operationPromise = new Promise((resolve, reject) => {
      resolveOperationPromise = resolve;
      rejectOperationPromise = reject;
    });
    const correlationId = crypto.randomUUID();
    const handleMessage = (compatibleReceiverMessage) => {
      try {
        if (sendMessageOperation.completed) {
          return;
        }
        if (compatibleReceiverMessage) {
          if (compatibleReceiverMessage.isUpdate) {
            if (sendMessageOperation.onMessageReceived) {
              try {
                sendMessageOperation.onMessageReceived(compatibleReceiverMessage.message);
              } catch (error) {
                sendMessageOperation.completed = true;
                rejectOperationPromise(error);
              }
            } else {
              sendMessageOperation.completed = true;
              rejectOperationPromise(new Error(`Native receiver expected a message handler, but no handler was supplied. Message: ${compatibleReceiverMessage.message}`));
            }
          } else {
            sendMessageOperation.completed = true;
            resolveOperationPromise(compatibleReceiverMessage.message);
          }
          return;
        }
      } catch {
      }
      sendMessageOperation.completed = true;
      resolveOperationPromise(compatibleReceiverMessage.message);
    };
    const handleError = (error) => {
      sendMessageOperation.completed = true;
      rejectOperationPromise(error);
    };
    const sendUpdate = (updateMessage) => {
      if (sendMessageOperation.completed) {
        throw new Error("Tried to send update for completed operation.");
      }
      executePluginAsync2("SendMessagePlugin", "sendMessage", [
        this._receiverName,
        updateMessage,
        correlationId
      ]);
    };
    const sendMessageOperation = new SendMessageOperation(operationPromise, sendUpdate);
    sendMessageOperation.onMessageReceived = onMessageReceived;
    try {
      await executePluginAsync2("SendMessagePlugin", "sendMessage", [this._receiverName, message, correlationId], (response) => {
        handleMessage(response);
      });
    } catch (error) {
      handleError(error);
    }
    return sendMessageOperation;
  }
};

// node_modules/@microsoft/power-apps/lib/internal/communication/SendMessage.js
var SendMessage = class _SendMessage {
  static createInstanceAsync() {
    return Promise.resolve(new _SendMessage());
  }
  constructor() {
  }
  async getMessageReceiverAsync(receiverName, isCompatibleChecker) {
    const versionInfo = await this._getVersionInfo(receiverName);
    if (versionInfo) {
      const compatibilityCheckerResult = isCompatibleChecker(versionInfo);
      if (compatibilityCheckerResult.isCompatible === false) {
        return new IncompatibleMessageReceiver(versionInfo, compatibilityCheckerResult.incompatibilityDescription || "");
      } else {
        return new CompatibleMessageReceiver(receiverName, versionInfo);
      }
    } else {
      return new IncompatibleMessageReceiver(void 0, `No receiver ${receiverName} registered.`);
    }
  }
  async _getVersionInfo(receiverName) {
    const result = await executePluginAsync2("SendMessagePlugin", "getVersionInfo", [receiverName]);
    return result;
  }
};

// node_modules/@microsoft/power-apps/lib/telemetry/LoggerManager.js
var loggerInstance;
async function setupLogger(logger) {
  loggerInstance = logger;
  const sendMessagePlugin = await SendMessage.createInstanceAsync();
  const receiver = await sendMessagePlugin.getMessageReceiverAsync("PowerApps.AppMonitorReceiver", (versionInfo) => {
    let isCompatible = false;
    if (versionInfo === "1.0.0") {
      isCompatible = true;
    }
    return { isCompatible };
  });
  if (receiver.isCompatible) {
    await receiver.sendMessage("initialize", (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.metrics) {
        for (const metric of parsedMessage.metrics) {
          loggerInstance.logMetric?.(metric);
        }
      }
    });
  }
}

// node_modules/@microsoft/power-apps/lib/telemetry/Performance.js
function getPerformanceData() {
  const performanceApi = new PerformanceApi();
  const perfData = {
    appTimeOrigin: performanceApi.timeOrigin
  };
  const navigationTimingEntries = performanceApi.getEntriesByType("navigation");
  const navigationTiming = navigationTimingEntries[0];
  if (navigationTiming) {
    perfData.appNavigateType = navigationTiming.type;
    perfData.appNavigationStart = navigationTiming.startTime;
    perfData.appNavigationDuration = navigationTiming.duration;
    perfData.appEncodedBodySize = navigationTiming.encodedBodySize;
    perfData.appNextHopProtocol = navigationTiming.nextHopProtocol;
    perfData.appDomainLookupStart = navigationTiming.domainLookupStart;
    perfData.appDomainLookupEnd = navigationTiming.domainLookupEnd;
    perfData.appConnectStart = navigationTiming.connectStart;
    perfData.appConnectEnd = navigationTiming.connectEnd;
    perfData.appSecureConnectionStart = navigationTiming.secureConnectionStart;
    perfData.appFetchStart = navigationTiming.fetchStart;
    perfData.appRequestStart = navigationTiming.requestStart;
    perfData.appResponseStart = navigationTiming.responseStart;
    perfData.appResponseEnd = navigationTiming.responseEnd;
    perfData.appLoadEventEnd = navigationTiming.loadEventEnd;
    perfData.appDomInteractive = navigationTiming.domInteractive;
    perfData.appDomContentLoadedEventStart = navigationTiming.domContentLoadedEventStart;
  }
  return perfData;
}
var PerformanceApi = class {
  _performance;
  constructor(targetWindow = window) {
    this._performance = targetWindow.performance;
  }
  get timeOrigin() {
    return this._performance?.timeOrigin;
  }
  getEntriesByType(type) {
    if (!this._performance?.getEntriesByType) {
      return [];
    }
    return this._performance.getEntriesByType(type);
  }
};

// node_modules/@microsoft/power-apps/lib/app/Lifecycle.js
var initializeCalled = false;
var resolveIsInitializedPromise;
var isInitializedPromise = new Promise((resolve) => {
  resolveIsInitializedPromise = resolve;
});
async function initialize(options) {
  if (!initializeCalled || !await isInitializedPromise) {
    initializeCalled = true;
    const { logger, data } = options ?? {};
    await initializePlugins();
    initializeData(data?.executor);
    if (logger) {
      setupLogger(logger);
    }
    executePlugin2("AppLifecycle", "notifyAppIndexLoaded");
    executePlugin2("AppLifecycle", "notifyAppLoaded", [getAppLoadedPerformanceData(), {}, ""]);
    resolveIsInitializedPromise(true);
  }
}
function getAppLoadedPerformanceData() {
  try {
    const perfData = getPerformanceData();
    return JSON.stringify(perfData);
  } catch (e) {
    return "{}";
  }
}
function getIsInitializedPromise() {
  return isInitializedPromise;
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/runtime/getRuntimeContext.js
async function getPowerSdkInstance(dataSourcesInfo) {
  await getIsInitializedPromise();
  const executor = getExecutor();
  const provider = powerDataSourcesInfoProvider_default.getInstance(dataSourcesInfo);
  return getPowerDataRuntime(provider, executor);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/createRecord.js
async function createRecordAsync(dataSourcesInfo, tableName, record) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.createRecordAsync(tableName, record);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/updateRecord.js
async function updateRecordAsync(dataSourcesInfo, tableName, recordId, changes) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.updateRecordAsync(tableName, recordId, changes);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/deleteRecord.js
async function deleteRecordAsync(dataSourcesInfo, tableName, recordId) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.deleteRecordAsync(tableName, recordId);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/retrieveRecord.js
async function retrieveRecordAsync(dataSourcesInfo, tableName, recordId, options) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.retrieveRecordAsync(tableName, recordId, options);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/retrieveMultipleRecords.js
async function retrieveMultipleRecordsAsync(dataSourcesInfo, tableName, options) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.retrieveMultipleRecordsAsync(tableName, options);
}

// node_modules/@microsoft/power-apps/lib/internal/data/core/api/execute.js
async function executeAsync(dataSourcesInfo, operation) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.executeAsync(operation);
}

// node_modules/@microsoft/power-apps/lib/data/powerAppsData.js
var _dataOperationExecutor;
function initializeData(dataOperationExecutorOverride) {
  _dataOperationExecutor = dataOperationExecutorOverride;
  initializeRuntime(new OperationExecutor());
}
function getDataOperationExecutor() {
  return _dataOperationExecutor;
}
function getClient(dataSourcesInfo) {
  return {
    createRecordAsync: (tableName, record) => {
      return createRecordAsync(dataSourcesInfo, tableName, record);
    },
    deleteRecordAsync: (tableName, recordId) => {
      return deleteRecordAsync(dataSourcesInfo, tableName, recordId);
    },
    executeAsync: (operation) => {
      return executeAsync(dataSourcesInfo, operation);
    },
    retrieveMultipleRecordsAsync: (tableName, options) => {
      return retrieveMultipleRecordsAsync(dataSourcesInfo, tableName, options);
    },
    retrieveRecordAsync: (tableName, recordId, options) => {
      return retrieveRecordAsync(dataSourcesInfo, tableName, recordId, options);
    },
    updateRecordAsync: (tableName, recordId, changes) => {
      return updateRecordAsync(dataSourcesInfo, tableName, recordId, changes);
    }
  };
}

export {
  executePluginAsync2 as executePluginAsync,
  getClient,
  initialize
};
//# sourceMappingURL=chunk-TCCU4CRZ.js.map
