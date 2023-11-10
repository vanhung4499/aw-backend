import { QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as mjml2html from 'mjml';
import { v4 as uuidV4 } from 'uuid';
import * as chalk from 'chalk';
import * as moment from 'moment';
import { EmailTemplateEnum } from '../models';
import { isNotEmpty } from '../common';

/**
 * Email templates utils functions.
 */
export class EmailTemplateUtils {
  public static globalPath = [
    'core',
    'seeds',
    'data',
    'default-email-templates',
  ];

  /**
   * Migrate email templates for specific folder
   *
   * @param queryRunner
   * @param folder
   */
  public static async migrateEmailTemplates(
    queryRunner: QueryRunner,
    folder: EmailTemplateEnum,
  ): Promise<void> {
    const templatePath = path.join(
      path.join(__dirname),
      '../',
      ...EmailTemplateUtils.globalPath,
    );

    // Found default email templates path
    if (EmailTemplateUtils.fileExists(templatePath)) {
      if (isNotEmpty(folder)) {
        const files = [];
        const folderPath = path.join(templatePath, folder);

        // Read directory for missing templates
        EmailTemplateUtils.readdirSync(folderPath, files);
        const templates = EmailTemplateUtils.filesToTemplates(files);

        await EmailTemplateUtils.createOrUpdateTemplates(
          queryRunner,
          templates,
        );

        console.log(
          chalk.magenta(
            `${moment().format(
              'DD.MM.YYYY HH:mm:ss',
            )} Migrated email templates for ${folderPath}`,
          ),
        );
      }
    }
  }

  /**
   * Read files directory
   *
   * @param dir
   * @param files
   */
  public static readdirSync(directory: string, files: string[] = []): void {
    // if directory exists.
    if (EmailTemplateUtils.fileExists(directory)) {
      const items = fs.readdirSync(directory);
      items.forEach((file: string) => {
        const filePath = path.join(directory, file);
        // if file path exists.
        if (EmailTemplateUtils.fileExists(filePath)) {
          // if directory found, do recurring check.
          if (fs.lstatSync(filePath).isDirectory()) {
            EmailTemplateUtils.readdirSync(filePath, files);
          } else {
            files.push(filePath);
          }
        }
      });
    }
  }

  /**
   * File path exists or not
   *
   * @param filePath
   * @returns
   */
  public static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Convert file path to email template
   *
   * @param path
   * @returns
   */
  public static pathToTemplate(path: string): Object {
    try {
      const template = new Object();
      const paths = path.replace(/\\/g, '/').split('/');

      // Also very fast but it will remove the element from the array also, this may or may
      // not matter in your case.
      const files = paths.pop().split('.', 2);

      // separate filename & extension
      const filename = files[0];
      const extension = files[1];

      template['languageCode'] = paths.pop();
      template['name'] = `${paths.pop()}/${filename}`;

      const fileContent = fs.readFileSync(path, 'utf8');
      switch (extension) {
        case 'mjml':
          template['mjml'] = fileContent;
          template['hbs'] = mjml2html(fileContent).html;
          break;
        case 'hbs':
          template['hbs'] = fileContent;
          break;
        default:
          console.log(
            `Warning: ${path} Will be ignored. Only .hbs and .mjml files are supported!`,
          );
          break;
      }
      if (!template['hbs']) {
        return;
      }
      return template;
    } catch (error) {
      console.log(
        'Something went wrong during path to template convert',
        path,
        error,
      );
      return;
    }
  }

  /**
   * Convert multiples files to templates
   *
   * @param files
   * @returns
   */
  public static filesToTemplates(files: string[] = []): Array<Object> {
    const templates: Array<Object> = [];
    for (const file of files) {
      const template = EmailTemplateUtils.pathToTemplate(file);
      templates.push(template);
    }
    return templates;
  }

  /**
   * Create or update email templates into database
   *
   * @param templates
   */
  public static async createOrUpdateTemplates(
    queryRunner: QueryRunner,
    templates: Array<Object> = [],
  ) {
    for await (const item of templates) {
      const { name, hbs, mjml = null } = item as any;
      const payload = [name, hbs, mjml];
      const isSqlite = ['sqlite', 'better-sqlite3'].includes(
        queryRunner.connection.options.type,
      );
      let query = `SELECT COUNT(*) FROM "email_template" WHERE ("name" = $1)`;
      if (isSqlite) {
        query = `SELECT COUNT(*) FROM "email_template" WHERE ("name" = ?)`;
      }
      const [template] = await queryRunner.connection.manager.query(query, [
        name,
      ]);

      if (parseInt(template.count, 10) > 0) {
        let update = `UPDATE "email_template" SET "hbs" = $1, "mjml" = $2 WHERE ("name" = $3)`;
        if (isSqlite) {
          update = `UPDATE "email_template" SET "hbs" = ?, "mjml" = ? WHERE ("name" = ?)`;
        }
        await queryRunner.connection.manager.query(update, [hbs, mjml, name]);
      } else {
        if (isSqlite) {
          payload.push(uuidV4());
          const insert = `INSERT INTO "email_template" ("name", "hbs", "mjml", "id") VALUES(?, ?, ?, ?)`;
          await queryRunner.connection.manager.query(insert, payload);
        } else {
          const insert = `INSERT INTO "email_template" ("name", "hbs", mjml) VALUES($1, $2, $3)`;
          await queryRunner.connection.manager.query(insert, payload);
        }
      }
    }
  }
}
