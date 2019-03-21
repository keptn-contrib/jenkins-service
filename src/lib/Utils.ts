class Utils {

  logMessage(keptnContext: string, message: string) {
    console.log(JSON.stringify({ 
      keptnContext: keptnContext,
      keptnService: 'jenkins-service',
      message: message,
    }));
  }
}

export { Utils };
