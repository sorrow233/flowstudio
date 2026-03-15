import seoConfig from '../../../seo-config.js';

const SITE_URL = new URL(seoConfig.siteUrl);

export const AUTH_EMAIL_CONFIG = {
    appName: 'Flow Studio',
    projectId: 'flow-7ffad',
    firebaseWebApiKey: 'AIzaSyA20FrNmdIPE2Sb9r97s7cj2w6MLYgcB_M',
    siteOrigin: SITE_URL.origin,
    continuePath: '/inspiration',
    fromEmail: 'Flow Studio <flow@notify.catzz.work>',
};

export function buildEmailLinkContinueUrl() {
    const redirectUrl = new URL(AUTH_EMAIL_CONFIG.continuePath, AUTH_EMAIL_CONFIG.siteOrigin);
    redirectUrl.searchParams.set('authFlow', 'email-link');
    return redirectUrl.toString();
}

export function getAuthEmailEnv(env = {}) {
    return {
        resendApiKey: env.RESEND_API_KEY || '',
        serviceAccountJson: env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
        fromEmail: env.AUTH_EMAIL_FROM || AUTH_EMAIL_CONFIG.fromEmail,
        replyTo: env.AUTH_EMAIL_REPLY_TO || '',
        linkDomain: env.AUTH_EMAIL_LINK_DOMAIN || '',
    };
}
