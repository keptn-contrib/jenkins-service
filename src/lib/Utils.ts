class Utils {

  logMessage(keptnContext: string, message: string) {
    console.log(JSON.stringify({ 
      keptnContext: keptnContext,
      keptnService: 'jenkins-service',
      logLevel: 'INFO',
      message: message,
    }));
  }
}

export { Utils };
