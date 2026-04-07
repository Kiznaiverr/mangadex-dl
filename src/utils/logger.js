import chalk from "chalk";

class Logger {
  info(message) {
    console.log(chalk.blue("[i]"), message);
  }

  success(message) {
    console.log(chalk.green("[+]"), message);
  }

  warn(message) {
    console.log(chalk.yellow("[!]"), message);
  }

  error(message) {
    console.log(chalk.red("[-]"), message);
  }

  debug(message) {
    if (process.env.DEBUG) {
      console.log(chalk.gray("[*]"), message);
    }
  }

  section(title) {
    console.log(chalk.cyan.bold(`\n-- ${title} --\n`));
  }

  card(title, content) {
    console.log(chalk.cyan.bold(`>> ${title}`));
    console.log(content);
  }
}

export default new Logger();
