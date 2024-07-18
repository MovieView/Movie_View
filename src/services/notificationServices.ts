import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';


export const createLoginNotification = async (connection: PoolConnection, userId: string) => {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 3, NULL);
  `;

  const createNotificationModelsSocialAccountsSql = `
    INSERT INTO movie_view.notification_models_social_accounts (id, notification_models_id, social_accounts_uid) VALUES
    (UNHEX(?), UNHEX(?), ?);
  `;
  const createNotificationModelsSocialAccountsSqlData = [
    uuidv4().replace(/-/g, ''),
    notificationModelsId,
    userId,
  ];

  try {
    const [createNotificationModelsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSql, 
      [notificationModelsId]
    );
    if (!createNotificationModelsResult.affectedRows) {
      return false;
    }

    const [createNotificationModelsSocialAccountsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSocialAccountsSql, 
      createNotificationModelsSocialAccountsSqlData
    );
    if (!createNotificationModelsSocialAccountsResult.affectedRows) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export const createReviewCommentNotification = async (
  connection: PoolConnection, 
  icon: string, 
  username: string,
  userId: string, 
  movieId: string
) => {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 2, ?);
  `;

  const createNotificationModelsData = {
    username,
    movieId,
    icon
  }

  const createNotificationModelsSocialAccountsSql = `
    INSERT INTO movie_view.notification_models_social_accounts (id, notification_models_id, social_accounts_uid) VALUES
    (UNHEX(?), UNHEX(?), ?);
  `;
  const createNotificationModelsSocialAccountsSqlData = [
    uuidv4().replace(/-/g, ''),
    notificationModelsId,
    userId,
  ];

  try {
    const [createNotificationModelsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSql, 
      [notificationModelsId, JSON.stringify(createNotificationModelsData)]
    );
    if (!createNotificationModelsResult.affectedRows) {
      return false;
    }

    const [createNotificationModelsSocialAccountsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSocialAccountsSql,
      createNotificationModelsSocialAccountsSqlData
    );
    if (!createNotificationModelsSocialAccountsResult.affectedRows) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function createReviewLikeNotification(
  recipientSocialAccountsUID: string,
  initiatorUsername: string,
  initiatorIconURL: string | undefined,
  movieId: string,
  connection: PoolConnection
): Promise<void> {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 1, ?);
  `;
  const notificationModelsData : {username: string, movieId: string, icon?: string} = {
    username: initiatorUsername,
    movieId,
  }
  if (initiatorIconURL) {
    notificationModelsData.icon = initiatorIconURL;
  }

  const createNotificationModelsSqlData = [
    notificationModelsId,
    JSON.stringify(notificationModelsData),
  ];

  const createNotificationModelsSocialAccountsSql = `
    INSERT INTO movie_view.notification_models_social_accounts (id, notification_models_id, social_accounts_uid) VALUES
    (UNHEX(?), UNHEX(?), ?);
  `;
  const createNotificationModelsSocialAccountsSqlData = [
    uuidv4().replace(/-/g, ''),
    notificationModelsId,
    recipientSocialAccountsUID,
  ];

  try {
    const [createNotificationModelsSqlResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSql, 
      createNotificationModelsSqlData
    );
    if (createNotificationModelsSqlResult.affectedRows === 0) {
      throw new Error('Failed to create notification model');
    }

    const [createNotificationModelsSocialAccountsSqlResult] =  await connection.execute<ResultSetHeader>(
      createNotificationModelsSocialAccountsSql, 
      createNotificationModelsSocialAccountsSqlData
    );
    if (createNotificationModelsSocialAccountsSqlResult.affectedRows === 0) {
      throw new Error('Failed to create notification model social accounts');
    }
  } catch (err) {
    throw err;
  }
}

export const deleteNotificationModelSocialAccounts = async (
  id: string,
  socialAccountsUID: string,
  connection: PoolConnection,
): Promise<boolean> => {
  const sqlQueryStatement = `
    DELETE FROM notification_models_social_accounts
    WHERE social_accounts_uid=? AND notification_models_id=UNHEX(?)
  `;

  try {
    const [result] = await connection.query<ResultSetHeader>(
      sqlQueryStatement, 
      [socialAccountsUID, id]
    );
    if (result.affectedRows === 0) {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
}

export const updateNotificationModelSocialAccountsAsRead = async (
  id: string,
  socialAccountsUID: string,
  connection: PoolConnection
): Promise<boolean> => {
  const sqlQueryStatement = `
    UPDATE notification_models_social_accounts
    SET checked=1
    WHERE social_accounts_uid=? AND notification_models_id=UNHEX(?)
  `;

  try {
    const [result] = await connection.query<ResultSetHeader>(
      sqlQueryStatement, 
      [socialAccountsUID, id]
    );
    if (result.affectedRows === 0) {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
}