const fs = require('fs');
const path = require('path');

const translationsDir = 'src/i18n/locales';

// Nouvelles traductions à ajouter
const newTranslations = {
    auth: {
        login: {
            title: "Connexion",
            email: "Adresse email :",
            password: "Mot de passe :",
            rememberMe: "Se souvenir de moi",
            forgotPassword: "Mot de passe oublié ?",
            loginButton: "Se connecter",
            loggingIn: "Connexion en cours...",
            noAccount: "Pas de compte ?",
            signup: "S'inscrire",
            errorNoToken: "Aucun token reçu. Veuillez réessayer.",
            errorLogin: "Email ou mot de passe incorrect. Veuillez réessayer.",
            showPassword: "Afficher le mot de passe",
            hidePassword: "Masquer le mot de passe",
            footer: "© {{year}} applyons. Réalisé avec par AuthenticPage."
        },
        signup: {
            title: "Créer un compte",
            personalInfo: "Informations personnelles",
            firstName: "Prénom *",
            lastName: "Nom *",
            gender: "Genre *",
            birthPlace: "Pays de naissance *",
            birthDate: "Date de naissance *",
            email: "Adresse email *",
            phone: "Téléphone",
            country: "Pays *",
            address: "Adresse",
            accountType: "Type de compte *",
            password: "Mot de passe *",
            confirmPassword: "Confirmer le mot de passe *",
            minPassword: "Minimum 6 caractères",
            orgInfo: {
                institut: "Informations de l'institution",
                traducteur: "Informations de l'agence",
                banque: "Informations de la banque"
            },
            orgName: "Nom de l'organisation *",
            orgType: "Type d'organisation *",
            orgEmail: "Email de l'organisation *",
            orgPhone: "Téléphone de l'organisation",
            orgWebsite: "Site web (optionnel)",
            orgAddress: "Adresse de l'organisation",
            orgNote: "Note : Vous serez automatiquement administrateur de cette organisation.",
            cancel: "Annuler",
            login: "Se connecter",
            createAccount: "Créer mon compte",
            createAccountAndOrg: "Créer le compte et l'organisation",
            creating: "Inscription en cours...",
            success: "Inscription réussie ! Vérifiez votre email pour activer le compte.",
            errors: {
                firstNameRequired: "Le prénom est obligatoire.",
                lastNameRequired: "Le nom est obligatoire.",
                genderRequired: "Le genre est obligatoire.",
                birthPlaceRequired: "Le lieu de naissance est obligatoire.",
                birthDateRequired: "La date de naissance est obligatoire.",
                birthDateInvalid: "Date de naissance invalide.",
                emailRequired: "L'email est obligatoire.",
                emailInvalid: "Email invalide.",
                passwordRequired: "Le mot de passe est obligatoire.",
                passwordMin: "Au moins 6 caractères.",
                passwordMismatch: "Les mots de passe ne correspondent pas.",
                orgNameRequired: "Le nom de l'organisation est obligatoire.",
                orgTypeRequired: "Le type d'organisation est obligatoire.",
                orgEmailRequired: "L'email de l'organisation est obligatoire.",
                orgEmailInvalid: "Email d'organisation invalide."
            },
            roles: {
                DEMANDEUR: "Demandeur",
                INSTITUT: "Institut/École/Entreprise",
                TRADUCTEUR: "Traducteur/Agence",
                BANQUE: "Banque/Institution financière"
            },
            orgTypes: {
                UNIVERSITE: "Université",
                COLLEGE: "Collège",
                LYCEE: "Lycée",
                ENTREPRISE: "Entreprise",
                TRADUCTEUR: "Agence de traduction",
                BANQUE: "Banque"
            },
            genders: {
                MALE: "Homme",
                FEMALE: "Femme",
                OTHER: "Autre"
            },
            placeholders: {
                firstName: "Jean",
                lastName: "Dupont",
                email: "jeandupont@example.com",
                phone: "+221 77 000 00 00",
                address: "123 rue de la paix, Dakar",
                orgNameInstitut: "Nom de votre institution",
                orgNameTraducteur: "Nom de votre agence",
                orgNameBanque: "Nom de votre banque",
                orgEmail: "contact@organisation.com",
                orgPhone: "+221 77 000 00 00",
                orgWebsite: "https://organisation.com",
                orgAddress: "Adresse complète de l'organisation",
                selectType: "Sélectionnez un type"
            }
        },
        resetPassword: {
            title: "Réinitialiser le mot de passe",
            subtitle: "Entrez votre adresse email, nous vous enverrons un lien de réinitialisation.",
            email: "Adresse Email :",
            sendLink: "Envoyer le lien",
            sending: "Envoi en cours...",
            login: "Se connecter",
            success: "Un email de réinitialisation a été envoyé.",
            error: "Erreur lors de l'envoi de l'email de réinitialisation.",
            footer: "© {{year}} applyons. Réaliser par AuthenticPage."
        },
        newPassword: {
            title: "Nouveau mot de passe",
            subtitle: "Veuillez saisir votre nouveau mot de passe",
            newPassword: "Nouveau mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            change: "Modifier le mot de passe",
            changing: "Modification en cours...",
            rememberPassword: "Vous vous souvenez de votre mot de passe ?",
            login: "Se connecter",
            success: "Mot de passe modifié !",
            successSubtitle: "Vous allez être redirigé vers la page de connexion.",
            errors: {
                passwordRequired: "Le mot de passe est requis",
                passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
                passwordLowercase: "Le mot de passe doit contenir au moins une lettre minuscule",
                passwordUppercase: "Le mot de passe doit contenir au moins une lettre majuscule",
                passwordNumber: "Le mot de passe doit contenir au moins un chiffre",
                confirmRequired: "Veuillez confirmer votre mot de passe",
                confirmMismatch: "Les mots de passe ne correspondent pas"
            },
            placeholders: {
                newPassword: "Saisissez votre nouveau mot de passe",
                confirmPassword: "Confirmez votre nouveau mot de passe"
            },
            error: "Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.",
            footer: "© {{year}} applyons. Tous droits réservés."
        }
    },
    adminDashboard: {
        hello: "Hello, {{firstName}} {{lastName}}",
        welcome: "Bienvenue!",
        kpis: {
            usersTotal: "Utilisateurs (total)",
            usersActive: "Actifs: {{count}}",
            organizationsTotal: "Organisations (total)",
            demandesTotal: "Demandes (total)",
            demandesBreakdown: "Voir la répartition ci-dessous",
            demandesNone: "Aucune demande",
            documentsTotal: "Documents (total)",
            documentsTranslated: "Traduit: {{count}}",
            transactionsTotal: "Transactions (total)",
            transactionsBreakdown: "Voir la répartition ci-dessous",
            paymentsTotal: "Paiements (total)",
            paymentsBreakdown: "Voir la répartition ci-dessous",
            abonnementsTotal: "Abonnements",
            abonnementsActive: "Actifs: {{active}} · Expirent bientôt: {{expiring}}",
            contactsTotal: "Contacts (messages)"
        },
        breakdowns: {
            usersByRole: "Répartition des rôles utilisateurs",
            orgsByType: "Répartition des types d'organisation",
            demandesByStatus: "Demandes par statut",
            transactionsByStatus: "Transactions par statut",
            paymentsByStatus: "Paiements par statut"
        },
        empty: {
            noItems: "— Aucun élément —",
            noData: "Aucune donnée à afficher.",
            freeSpace: "Espace libre pour un graphique/activité récente"
        },
        error: "Error fetching stats"
    },
    traducteurDashboard: {
        hello: "Hello, {{firstName}} {{lastName}}",
        welcome: "Bienvenue!",
        kpis: {
            usersTotal: "Utilisateurs (total)",
            usersActive: "Actifs: {{count}}",
            organizationsTotal: "Organisations (total)",
            demandesTotal: "Demandes (total)",
            demandesBreakdown: "Voir la répartition ci-dessous",
            demandesNone: "Aucune demande",
            documentsTotal: "Documents (total)",
            documentsTranslated: "Traduit: {{count}}",
            transactionsTotal: "Transactions (total)",
            transactionsBreakdown: "Voir la répartition ci-dessous",
            paymentsTotal: "Paiements (total)",
            paymentsBreakdown: "Voir la répartition ci-dessous",
            abonnementsTotal: "Abonnements",
            abonnementsActive: "Actifs: {{active}} · Expirent bientôt: {{expiring}}",
            contactsTotal: "Contacts (messages)"
        },
        breakdowns: {
            usersByRole: "Répartition des rôles utilisateurs",
            orgsByType: "Répartition des types d'organisation",
            demandesByStatus: "Demandes par statut",
            transactionsByStatus: "Transactions par statut",
            paymentsByStatus: "Paiements par statut"
        },
        empty: {
            noItems: "— Aucun élément —",
            noData: "Aucune donnée à afficher.",
            freeSpace: "Espace libre pour un graphique/activité récente"
        },
        error: "Error fetching stats"
    }
};

// Traductions pour chaque langue
const translations = {
    fr: newTranslations,
    en: {
        auth: {
            login: {
                title: "Login",
                email: "Email address:",
                password: "Password:",
                rememberMe: "Remember me",
                forgotPassword: "Forgot password?",
                loginButton: "Sign in",
                loggingIn: "Logging in...",
                noAccount: "No account?",
                signup: "Sign up",
                errorNoToken: "No token received. Please try again.",
                errorLogin: "Incorrect email or password. Please try again.",
                showPassword: "Show password",
                hidePassword: "Hide password",
                footer: "© {{year}} applyons. All rights reserved."
            },  
            signup: {
                title: "Create an account",
                personalInfo: "Personal information",
                firstName: "First name *",
                lastName: "Last name *",
                gender: "Gender *",
                birthPlace: "Country of birth *",
                birthDate: "Date of birth *",
                email: "Email address *",
                phone: "Phone",
                country: "Country *",
                address: "Address",
                accountType: "Account type *",
                password: "Password *",
                confirmPassword: "Confirm password *",
                minPassword: "Minimum 6 characters",
                orgInfo: {
                    institut: "Institution information",
                    traducteur: "Agency information",
                    banque: "Bank information"
                },
                orgName: "Organization name *",
                orgType: "Organization type *",
                orgEmail: "Organization email *",
                orgPhone: "Organization phone",
                orgWebsite: "Website (optional)",
                orgAddress: "Organization address",
                orgNote: "Note: You will automatically be the administrator of this organization.",
                cancel: "Cancel",
                login: "Sign in",
                createAccount: "Create my account",
                createAccountAndOrg: "Create account and organization",
                creating: "Signing up...",
                success: "Registration successful! Check your email to activate your account.",
                errors: {
                    firstNameRequired: "First name is required.",
                    lastNameRequired: "Last name is required.",
                    genderRequired: "Gender is required.",
                    birthPlaceRequired: "Country of birth is required.",
                    birthDateRequired: "Date of birth is required.",
                    birthDateInvalid: "Invalid date of birth.",
                    emailRequired: "Email is required.",
                    emailInvalid: "Invalid email.",
                    passwordRequired: "Password is required.",
                    passwordMin: "At least 6 characters.",
                    passwordMismatch: "Passwords do not match.",
                    orgNameRequired: "Organization name is required.",
                    orgTypeRequired: "Organization type is required.",
                    orgEmailRequired: "Organization email is required.",
                    orgEmailInvalid: "Invalid organization email."
                },
                roles: {
                    DEMANDEUR: "Applicant",
                    INSTITUT: "Institute/School/Company",
                    TRADUCTEUR: "Translator/Agency",
                    BANQUE: "Bank/Financial institution"
                },
                orgTypes: {
                    UNIVERSITE: "University",
                    COLLEGE: "College",
                    LYCEE: "High School",
                    ENTREPRISE: "Company",
                    TRADUCTEUR: "Translation agency",
                    BANQUE: "Bank"
                },
                genders: {
                    MALE: "Male",
                    FEMALE: "Female",
                    OTHER: "Other"
                },
                placeholders: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@example.com",
                    phone: "+1 234 567 8900",
                    address: "123 Main St, City",
                    orgNameInstitut: "Your institution name",
                    orgNameTraducteur: "Your agency name",
                    orgNameBanque: "Your bank name",
                    orgEmail: "contact@organization.com",
                    orgPhone: "+1 234 567 8900",
                    orgWebsite: "https://organization.com",
                    orgAddress: "Full organization address",
                    selectType: "Select a type"
                }
            },
            resetPassword: {
                title: "Reset password",
                subtitle: "Enter your email address, we will send you a reset link.",
                email: "Email address:",
                sendLink: "Send link",
                sending: "Sending...",
                login: "Sign in",
                success: "A password reset email has been sent.",
                error: "Error sending password reset email.",
                footer: "© {{year}} applyons. All rights reserved."
            },
            newPassword: {  
                title: "New password",
                subtitle: "Please enter your new password",
                newPassword: "New password",
                confirmPassword: "Confirm password",
                change: "Change password",
                changing: "Changing...",
                rememberPassword: "Remember your password?",
                login: "Sign in",
                success: "Password changed!",
                successSubtitle: "You will be redirected to the login page.",
                errors: {
                    passwordRequired: "Password is required",
                    passwordMin: "Password must contain at least 8 characters",
                    passwordLowercase: "Password must contain at least one lowercase letter",
                    passwordUppercase: "Password must contain at least one uppercase letter",
                    passwordNumber: "Password must contain at least one number",
                    confirmRequired: "Please confirm your password",
                    confirmMismatch: "Passwords do not match"
                },
                placeholders: {
                    newPassword: "Enter your new password",
                    confirmPassword: "Confirm your new password"
                },
                error: "Error resetting password. Please try again.",
                footer: "© {{year}} applyons. All rights reserved."
            }
        },
        adminDashboard: {
            hello: "Hello, {{firstName}} {{lastName}}",
            welcome: "Welcome!",
            kpis: {
                usersTotal: "Users (total)",
                usersActive: "Active: {{count}}",
                organizationsTotal: "Organizations (total)",
                demandesTotal: "Requests (total)",
                demandesBreakdown: "See breakdown below",
                demandesNone: "No requests",
                documentsTotal: "Documents (total)",
                documentsTranslated: "Translated: {{count}}",
                transactionsTotal: "Transactions (total)",
                transactionsBreakdown: "See breakdown below",
                paymentsTotal: "Payments (total)",
                paymentsBreakdown: "See breakdown below",
                abonnementsTotal: "Subscriptions",
                abonnementsActive: "Active: {{active}} · Expiring soon: {{expiring}}",
                contactsTotal: "Contacts (messages)"
            },
            breakdowns: {
                usersByRole: "User roles breakdown",
                orgsByType: "Organization types breakdown",
                demandesByStatus: "Requests by status",
                transactionsByStatus: "Transactions by status",
                paymentsByStatus: "Payments by status"
            },
            empty: {
                noItems: "— No items —",
                noData: "No data to display.",
                freeSpace: "Free space for a chart/recent activity"
            },
            error: "Error fetching stats"
        },
        traducteurDashboard: {
            hello: "Hello, {{firstName}} {{lastName}}",
            welcome: "Welcome!",
            kpis: {
                usersTotal: "Users (total)",
                usersActive: "Active: {{count}}",
                organizationsTotal: "Organizations (total)",
                demandesTotal: "Requests (total)",
                demandesBreakdown: "See breakdown below",
                demandesNone: "No requests",
                documentsTotal: "Documents (total)",
                documentsTranslated: "Translated: {{count}}",
                transactionsTotal: "Transactions (total)",
                transactionsBreakdown: "See breakdown below",
                paymentsTotal: "Payments (total)",
                paymentsBreakdown: "See breakdown below",
                abonnementsTotal: "Subscriptions",
                abonnementsActive: "Active: {{active}} · Expiring soon: {{expiring}}",
                contactsTotal: "Contacts (messages)"
            },
            breakdowns: {
                usersByRole: "User roles breakdown",
                orgsByType: "Organization types breakdown",
                demandesByStatus: "Requests by status",
                transactionsByStatus: "Transactions by status",
                paymentsByStatus: "Payments by status"
            },
            empty: {
                noItems: "— No items —",
                noData: "No data to display.",
                freeSpace: "Free space for a chart/recent activity"
            },
            error: "Error fetching stats"
        }
    },
    es: {
        auth: {
            login: {
                title: "Iniciar sesión",
                email: "Dirección de correo:",
                password: "Contraseña:",
                rememberMe: "Recordarme",
                forgotPassword: "¿Olvidaste tu contraseña?",
                loginButton: "Iniciar sesión",
                loggingIn: "Iniciando sesión...",
                noAccount: "¿No tienes cuenta?",
                signup: "Regístrate",
                errorNoToken: "No se recibió token. Por favor, inténtalo de nuevo.",
                errorLogin: "Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.",
                showPassword: "Mostrar contraseña",
                hidePassword: "Ocultar contraseña",
                footer: "© {{year}} applyons. Hecho con por AuthenticPage."
            },
            signup: {
                title: "Crear una cuenta",
                personalInfo: "Información personal",
                firstName: "Nombre *",
                lastName: "Apellido *",
                gender: "Género *",
                birthPlace: "País de nacimiento *",
                birthDate: "Fecha de nacimiento *",
                email: "Dirección de correo *",
                phone: "Teléfono",
                country: "País *",
                address: "Dirección",
                accountType: "Tipo de cuenta *",
                password: "Contraseña *",
                confirmPassword: "Confirmar contraseña *",
                minPassword: "Mínimo 6 caracteres",
                orgInfo: {
                    institut: "Información de la institución",
                    traducteur: "Información de la agencia",
                    banque: "Información del banco"
                },
                orgName: "Nombre de la organización *",
                orgType: "Tipo de organización *",
                orgEmail: "Correo de la organización *",
                orgPhone: "Teléfono de la organización",
                orgWebsite: "Sitio web (opcional)",
                orgAddress: "Dirección de la organización",
                orgNote: "Nota: Serás automáticamente administrador de esta organización.",
                cancel: "Cancelar",
                login: "Iniciar sesión",
                createAccount: "Crear mi cuenta",
                createAccountAndOrg: "Crear cuenta y organización",
                creating: "Registrándose...",
                success: "¡Registro exitoso! Verifica tu correo para activar tu cuenta.",
                errors: {
                    firstNameRequired: "El nombre es obligatorio.",
                    lastNameRequired: "El apellido es obligatorio.",
                    genderRequired: "El género es obligatorio.",
                    birthPlaceRequired: "El país de nacimiento es obligatorio.",
                    birthDateRequired: "La fecha de nacimiento es obligatoria.",
                    birthDateInvalid: "Fecha de nacimiento inválida.",
                    emailRequired: "El correo es obligatorio.",
                    emailInvalid: "Correo inválido.",
                    passwordRequired: "La contraseña es obligatoria.",
                    passwordMin: "Al menos 6 caracteres.",
                    passwordMismatch: "Las contraseñas no coinciden.",
                    orgNameRequired: "El nombre de la organización es obligatorio.",
                    orgTypeRequired: "El tipo de organización es obligatorio.",
                    orgEmailRequired: "El correo de la organización es obligatorio.",
                    orgEmailInvalid: "Correo de organización inválido."
                },
                roles: {
                    DEMANDEUR: "Solicitante",
                    INSTITUT: "Instituto/Escuela/Empresa",
                    TRADUCTEUR: "Traductor/Agencia",
                    BANQUE: "Banco/Institución financiera"
                },
                orgTypes: {
                    UNIVERSITE: "Universidad",
                    COLLEGE: "Colegio",
                    LYCEE: "Liceo",
                    ENTREPRISE: "Empresa",
                    TRADUCTEUR: "Agencia de traducción",
                    BANQUE: "Banco"
                },
                genders: {
                    MALE: "Hombre",
                    FEMALE: "Mujer",
                    OTHER: "Otro"
                },
                placeholders: {
                    firstName: "Juan",
                    lastName: "Pérez",
                    email: "juanperez@ejemplo.com",
                    phone: "+34 123 456 789",
                    address: "123 Calle Principal, Ciudad",
                    orgNameInstitut: "Nombre de tu institución",
                    orgNameTraducteur: "Nombre de tu agencia",
                    orgNameBanque: "Nombre de tu banco",
                    orgEmail: "contacto@organizacion.com",
                    orgPhone: "+34 123 456 789",
                    orgWebsite: "https://organizacion.com",
                    orgAddress: "Dirección completa de la organización",
                    selectType: "Selecciona un tipo"
                }
            },
            resetPassword: {
                title: "Restablecer contraseña",
                subtitle: "Ingresa tu dirección de correo, te enviaremos un enlace de restablecimiento.",
                email: "Dirección de correo:",
                sendLink: "Enviar enlace",
                sending: "Enviando...",
                login: "Iniciar sesión",
                success: "Se ha enviado un correo de restablecimiento de contraseña.",
                error: "Error al enviar el correo de restablecimiento de contraseña.",
                footer: "© {{year}} applyons. Hecho por AuthenticPage."
            },
            newPassword: {
                title: "Nueva contraseña",
                subtitle: "Por favor ingresa tu nueva contraseña",
                newPassword: "Nueva contraseña",
                confirmPassword: "Confirmar contraseña",
                change: "Cambiar contraseña",
                changing: "Cambiando...",
                rememberPassword: "¿Recuerdas tu contraseña?",
                login: "Iniciar sesión",
                success: "¡Contraseña cambiada!",
                successSubtitle: "Serás redirigido a la página de inicio de sesión.",
                errors: {
                    passwordRequired: "La contraseña es obligatoria",
                    passwordMin: "La contraseña debe contener al menos 8 caracteres",
                    passwordLowercase: "La contraseña debe contener al menos una letra minúscula",
                    passwordUppercase: "La contraseña debe contener al menos una letra mayúscula",
                    passwordNumber: "La contraseña debe contener al menos un número",
                    confirmRequired: "Por favor confirma tu contraseña",
                    confirmMismatch: "Las contraseñas no coinciden"
                },
                placeholders: {
                    newPassword: "Ingresa tu nueva contraseña",
                    confirmPassword: "Confirma tu nueva contraseña"
                },
                error: "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.",
                footer: "© {{year}} applyons. Hecho con ❤️ por ADM."
            }
        },
        adminDashboard: {
            hello: "Hola, {{firstName}} {{lastName}}",
            welcome: "¡Bienvenido!",
            kpis: {
                usersTotal: "Usuarios (total)",
                usersActive: "Activos: {{count}}",
                organizationsTotal: "Organizaciones (total)",
                demandesTotal: "Solicitudes (total)",
                demandesBreakdown: "Ver desglose a continuación",
                demandesNone: "Sin solicitudes",
                documentsTotal: "Documentos (total)",
                documentsTranslated: "Traducidos: {{count}}",
                transactionsTotal: "Transacciones (total)",
                transactionsBreakdown: "Ver desglose a continuación",
                paymentsTotal: "Pagos (total)",
                paymentsBreakdown: "Ver desglose a continuación",
                abonnementsTotal: "Suscripciones",
                abonnementsActive: "Activas: {{active}} · Próximas a expirar: {{expiring}}",
                contactsTotal: "Contactos (mensajes)"
            },
            breakdowns: {
                usersByRole: "Desglose de roles de usuarios",
                orgsByType: "Desglose de tipos de organización",
                demandesByStatus: "Solicitudes por estado",
                transactionsByStatus: "Transacciones por estado",
                paymentsByStatus: "Pagos por estado"
            },
            empty: {
                noItems: "— Sin elementos —",
                noData: "No hay datos para mostrar.",
                freeSpace: "Espacio libre para un gráfico/actividad reciente"
            },
            error: "Error al obtener estadísticas"
        },
        traducteurDashboard: {
            hello: "Hola, {{firstName}} {{lastName}}",
            welcome: "¡Bienvenido!",
            kpis: {
                usersTotal: "Usuarios (total)",
                usersActive: "Activos: {{count}}",
                organizationsTotal: "Organizaciones (total)",
                demandesTotal: "Solicitudes (total)",
                demandesBreakdown: "Ver desglose a continuación",
                demandesNone: "Sin solicitudes",
                documentsTotal: "Documentos (total)",
                documentsTranslated: "Traducidos: {{count}}",
                transactionsTotal: "Transacciones (total)",
                transactionsBreakdown: "Ver desglose a continuación",
                paymentsTotal: "Pagos (total)",
                paymentsBreakdown: "Ver desglose a continuación",
                abonnementsTotal: "Suscripciones",
                abonnementsActive: "Activas: {{active}} · Próximas a expirar: {{expiring}}",
                contactsTotal: "Contactos (mensajes)"
            },
            breakdowns: {
                usersByRole: "Desglose de roles de usuarios",
                orgsByType: "Desglose de tipos de organización",
                demandesByStatus: "Solicitudes por estado",
                transactionsByStatus: "Transacciones por estado",
                paymentsByStatus: "Pagos por estado"
            },
            empty: {
                noItems: "— Sin elementos —",
                noData: "No hay datos para mostrar.",
                freeSpace: "Espacio libre para un gráfico/actividad reciente"
            },
            error: "Error al obtener estadísticas"
        }
    },
    it: {
        auth: {
            login: {
                title: "Accedi",
                email: "Indirizzo email:",
                password: "Password:",
                rememberMe: "Ricordami",
                forgotPassword: "Password dimenticata?",
                loginButton: "Accedi",
                loggingIn: "Accesso in corso...",
                noAccount: "Non hai un account?",
                signup: "Registrati",
                errorNoToken: "Nessun token ricevuto. Riprova.",
                errorLogin: "Email o password errati. Riprova.",
                showPassword: "Mostra password",
                hidePassword: "Nascondi password",
                footer: "© {{year}} applyons. Realizzato con da AuthenticPage."
            },
            signup: {
                title: "Crea un account",
                personalInfo: "Informazioni personali",
                firstName: "Nome *",
                lastName: "Cognome *",
                gender: "Genere *",
                birthPlace: "Paese di nascita *",
                birthDate: "Data di nascita *",
                email: "Indirizzo email *",
                phone: "Telefono",
                country: "Paese *",
                address: "Indirizzo",
                accountType: "Tipo di account *",
                password: "Password *",
                confirmPassword: "Conferma password *",
                minPassword: "Minimo 6 caratteri",
                orgInfo: {
                    institut: "Informazioni dell'istituto",
                    traducteur: "Informazioni dell'agenzia",
                    banque: "Informazioni della banca"
                },
                orgName: "Nome dell'organizzazione *",
                orgType: "Tipo di organizzazione *",
                orgEmail: "Email dell'organizzazione *",
                orgPhone: "Telefono dell'organizzazione",
                orgWebsite: "Sito web (opzionale)",
                orgAddress: "Indirizzo dell'organizzazione",
                orgNote: "Nota: Sarai automaticamente amministratore di questa organizzazione.",
                cancel: "Annulla",
                login: "Accedi",
                createAccount: "Crea il mio account",
                createAccountAndOrg: "Crea account e organizzazione",
                creating: "Registrazione in corso...",
                success: "Registrazione riuscita! Controlla la tua email per attivare l'account.",
                errors: {
                    firstNameRequired: "Il nome è obbligatorio.",
                    lastNameRequired: "Il cognome è obbligatorio.",
                    genderRequired: "Il genere è obbligatorio.",
                    birthPlaceRequired: "Il paese di nascita è obbligatorio.",
                    birthDateRequired: "La data di nascita è obbligatoria.",
                    birthDateInvalid: "Data di nascita non valida.",
                    emailRequired: "L'email è obbligatoria.",
                    emailInvalid: "Email non valida.",
                    passwordRequired: "La password è obbligatoria.",
                    passwordMin: "Almeno 6 caratteri.",
                    passwordMismatch: "Le password non corrispondono.",
                    orgNameRequired: "Il nome dell'organizzazione è obbligatorio.",
                    orgTypeRequired: "Il tipo di organizzazione è obbligatorio.",
                    orgEmailRequired: "L'email dell'organizzazione è obbligatoria.",
                    orgEmailInvalid: "Email dell'organizzazione non valida."
                },
                roles: {
                    DEMANDEUR: "Richiedente",
                    INSTITUT: "Istituto/Scuola/Azienda",
                    TRADUCTEUR: "Traduttore/Agenzia",
                    BANQUE: "Banca/Istituzione finanziaria"
                },
                orgTypes: {
                    UNIVERSITE: "Università",
                    COLLEGE: "Collegio",
                    LYCEE: "Liceo",
                    ENTREPRISE: "Azienda",
                    TRADUCTEUR: "Agenzia di traduzione",
                    BANQUE: "Banca"
                },
                genders: {
                    MALE: "Uomo",
                    FEMALE: "Donna",
                    OTHER: "Altro"
                },
                placeholders: {
                    firstName: "Mario",
                    lastName: "Rossi",
                    email: "mariorossi@esempio.com",
                    phone: "+39 123 456 7890",
                    address: "123 Via Principale, Città",
                    orgNameInstitut: "Nome della tua istituzione",
                    orgNameTraducteur: "Nome della tua agenzia",
                    orgNameBanque: "Nome della tua banca",
                    orgEmail: "contatto@organizzazione.com",
                    orgPhone: "+39 123 456 7890",
                    orgWebsite: "https://organizzazione.com",
                    orgAddress: "Indirizzo completo dell'organizzazione",
                    selectType: "Seleziona un tipo"
                }
            },
            resetPassword: {
                title: "Reimposta password",
                subtitle: "Inserisci il tuo indirizzo email, ti invieremo un link di reimpostazione.",
                email: "Indirizzo email:",
                sendLink: "Invia link",
                sending: "Invio in corso...",
                login: "Accedi",
                success: "È stata inviata un'email di reimpostazione password.",
                error: "Errore nell'invio dell'email di reimpostazione password.",
                footer: "© {{year}} applyons. Realizzato da AuthenticPage."
            },
            newPassword: {
                title: "Nuova password",
                subtitle: "Inserisci la tua nuova password",
                newPassword: "Nuova password",
                confirmPassword: "Conferma password",
                change: "Cambia password",
                changing: "Cambio in corso...",
                rememberPassword: "Ricordi la tua password?",
                login: "Accedi",
                success: "Password cambiata!",
                successSubtitle: "Sarai reindirizzato alla pagina di accesso.",
                errors: {
                    passwordRequired: "La password è obbligatoria",
                    passwordMin: "La password deve contenere almeno 8 caratteri",
                    passwordLowercase: "La password deve contenere almeno una lettera minuscola",
                    passwordUppercase: "La password deve contenere almeno una lettera maiuscola",
                    passwordNumber: "La password deve contenere almeno un numero",
                    confirmRequired: "Conferma la tua password",
                    confirmMismatch: "Le password non corrispondono"
                },
                placeholders: {
                    newPassword: "Inserisci la tua nuova password",
                    confirmPassword: "Conferma la tua nuova password"
                },
                error: "Errore nella reimpostazione della password. Riprova.",
                footer: "© {{year}} applyons. Realizzato con ❤️ da ADM."
            }
        },
        adminDashboard: {
            hello: "Ciao, {{firstName}} {{lastName}}",
            welcome: "Benvenuto!",
            kpis: {
                usersTotal: "Utenti (totale)",
                usersActive: "Attivi: {{count}}",
                organizationsTotal: "Organizzazioni (totale)",
                demandesTotal: "Richieste (totale)",
                demandesBreakdown: "Vedi ripartizione qui sotto",
                demandesNone: "Nessuna richiesta",
                documentsTotal: "Documenti (totale)",
                documentsTranslated: "Tradotti: {{count}}",
                transactionsTotal: "Transazioni (totale)",
                transactionsBreakdown: "Vedi ripartizione qui sotto",
                paymentsTotal: "Pagamenti (totale)",
                paymentsBreakdown: "Vedi ripartizione qui sotto",
                abonnementsTotal: "Abbonamenti",
                abonnementsActive: "Attivi: {{active}} · In scadenza: {{expiring}}",
                contactsTotal: "Contatti (messaggi)"
            },
            breakdowns: {
                usersByRole: "Ripartizione ruoli utenti",
                orgsByType: "Ripartizione tipi di organizzazione",
                demandesByStatus: "Richieste per stato",
                transactionsByStatus: "Transazioni per stato",
                paymentsByStatus: "Pagamenti per stato"
            },
            empty: {
                noItems: "— Nessun elemento —",
                noData: "Nessun dato da visualizzare.",
                freeSpace: "Spazio libero per un grafico/attività recente"
            },
            error: "Errore nel recupero delle statistiche"
        },
        traducteurDashboard: {
            hello: "Ciao, {{firstName}} {{lastName}}",
            welcome: "Benvenuto!",
            kpis: {
                usersTotal: "Utenti (totale)",
                usersActive: "Attivi: {{count}}",
                organizationsTotal: "Organizzazioni (totale)",
                demandesTotal: "Richieste (totale)",
                demandesBreakdown: "Vedi ripartizione qui sotto",
                demandesNone: "Nessuna richiesta",
                documentsTotal: "Documenti (totale)",
                documentsTranslated: "Tradotti: {{count}}",
                transactionsTotal: "Transazioni (totale)",
                transactionsBreakdown: "Vedi ripartizione qui sotto",
                paymentsTotal: "Pagamenti (totale)",
                paymentsBreakdown: "Vedi ripartizione qui sotto",
                abonnementsTotal: "Abbonamenti",
                abonnementsActive: "Attivi: {{active}} · In scadenza: {{expiring}}",
                contactsTotal: "Contatti (messaggi)"
            },
            breakdowns: {
                usersByRole: "Ripartizione ruoli utenti",
                orgsByType: "Ripartizione tipi di organizzazione",
                demandesByStatus: "Richieste per stato",
                transactionsByStatus: "Transazioni per stato",
                paymentsByStatus: "Pagamenti per stato"
            },
            empty: {
                noItems: "— Nessun elemento —",
                noData: "Nessun dato da visualizzare.",
                freeSpace: "Spazio libero per un grafico/attività recente"
            },
            error: "Errore nel recupero delle statistiche"
        }
    },
    de: {
        auth: {
            login: {
                title: "Anmelden",
                email: "E-Mail-Adresse:",
                password: "Passwort:",
                rememberMe: "Angemeldet bleiben",
                forgotPassword: "Passwort vergessen?",
                loginButton: "Anmelden",
                loggingIn: "Anmeldung läuft...",
                noAccount: "Kein Konto?",
                signup: "Registrieren",
                errorNoToken: "Kein Token erhalten. Bitte versuchen Sie es erneut.",
                errorLogin: "Falsche E-Mail oder Passwort. Bitte versuchen Sie es erneut.",
                showPassword: "Passwort anzeigen",
                hidePassword: "Passwort ausblenden",
                footer: "© {{year}} applyons. Erstellt mit von AuthenticPage."
            },
            signup: {
                title: "Konto erstellen",
                personalInfo: "Persönliche Informationen",
                firstName: "Vorname *",
                lastName: "Nachname *",
                gender: "Geschlecht *",
                birthPlace: "Geburtsland *",
                birthDate: "Geburtsdatum *",
                email: "E-Mail-Adresse *",
                phone: "Telefon",
                country: "Land *",
                address: "Adresse",
                accountType: "Kontotyp *",
                password: "Passwort *",
                confirmPassword: "Passwort bestätigen *",
                minPassword: "Mindestens 6 Zeichen",
                orgInfo: {
                    institut: "Institutsinformationen",
                    traducteur: "Agenturinformationen",
                    banque: "Bankinformationen"
                },
                orgName: "Organisationsname *",
                orgType: "Organisationstyp *",
                orgEmail: "Organisations-E-Mail *",
                orgPhone: "Organisationstelefon",
                orgWebsite: "Website (optional)",
                orgAddress: "Organisationsadresse",
                orgNote: "Hinweis: Sie werden automatisch Administrator dieser Organisation.",
                cancel: "Abbrechen",
                login: "Anmelden",
                createAccount: "Mein Konto erstellen",
                createAccountAndOrg: "Konto und Organisation erstellen",
                creating: "Registrierung läuft...",
                success: "Registrierung erfolgreich! Überprüfen Sie Ihre E-Mail, um Ihr Konto zu aktivieren.",
                errors: {
                    firstNameRequired: "Vorname ist erforderlich.",
                    lastNameRequired: "Nachname ist erforderlich.",
                    genderRequired: "Geschlecht ist erforderlich.",
                    birthPlaceRequired: "Geburtsland ist erforderlich.",
                    birthDateRequired: "Geburtsdatum ist erforderlich.",
                    birthDateInvalid: "Ungültiges Geburtsdatum.",
                    emailRequired: "E-Mail ist erforderlich.",
                    emailInvalid: "Ungültige E-Mail.",
                    passwordRequired: "Passwort ist erforderlich.",
                    passwordMin: "Mindestens 6 Zeichen.",
                    passwordMismatch: "Passwörter stimmen nicht überein.",
                    orgNameRequired: "Organisationsname ist erforderlich.",
                    orgTypeRequired: "Organisationstyp ist erforderlich.",
                    orgEmailRequired: "Organisations-E-Mail ist erforderlich.",
                    orgEmailInvalid: "Ungültige Organisations-E-Mail."
                },
                roles: {
                    DEMANDEUR: "Antragsteller",
                    INSTITUT: "Institut/Schule/Unternehmen",
                    TRADUCTEUR: "Übersetzer/Agentur",
                    BANQUE: "Bank/Finanzinstitut"
                },
                orgTypes: {
                    UNIVERSITE: "Universität",
                    COLLEGE: "College",
                    LYCEE: "Gymnasium",
                    ENTREPRISE: "Unternehmen",
                    TRADUCTEUR: "Übersetzungsagentur",
                    BANQUE: "Bank"
                },
                genders: {
                    MALE: "Männlich",
                    FEMALE: "Weiblich",
                    OTHER: "Andere"
                },
                placeholders: {
                    firstName: "Max",
                    lastName: "Mustermann",
                    email: "maxmustermann@beispiel.com",
                    phone: "+49 123 456 7890",
                    address: "123 Hauptstraße, Stadt",
                    orgNameInstitut: "Ihr Institutsname",
                    orgNameTraducteur: "Ihr Agenturname",
                    orgNameBanque: "Ihr Bankname",
                    orgEmail: "kontakt@organisation.com",
                    orgPhone: "+49 123 456 7890",
                    orgWebsite: "https://organisation.com",
                    orgAddress: "Vollständige Organisationsadresse",
                    selectType: "Typ auswählen"
                }
            },
            resetPassword: {
                title: "Passwort zurücksetzen",
                subtitle: "Geben Sie Ihre E-Mail-Adresse ein, wir senden Ihnen einen Reset-Link.",
                email: "E-Mail-Adresse:",
                sendLink: "Link senden",
                sending: "Wird gesendet...",
                login: "Anmelden",
                success: "Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.",
                error: "Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts.",
                footer: "© {{year}} applyons. Erstellt von AuthenticPage."
            },
            newPassword: {
                title: "Neues Passwort",
                subtitle: "Bitte geben Sie Ihr neues Passwort ein",
                newPassword: "Neues Passwort",
                confirmPassword: "Passwort bestätigen",
                change: "Passwort ändern",
                changing: "Wird geändert...",
                rememberPassword: "Erinnern Sie sich an Ihr Passwort?",
                login: "Anmelden",
                success: "Passwort geändert!",
                successSubtitle: "Sie werden zur Anmeldeseite weitergeleitet.",
                errors: {
                    passwordRequired: "Passwort ist erforderlich",
                    passwordMin: "Passwort muss mindestens 8 Zeichen enthalten",
                    passwordLowercase: "Passwort muss mindestens einen Kleinbuchstaben enthalten",
                    passwordUppercase: "Passwort muss mindestens einen Großbuchstaben enthalten",
                    passwordNumber: "Passwort muss mindestens eine Zahl enthalten",
                    confirmRequired: "Bitte bestätigen Sie Ihr Passwort",
                    confirmMismatch: "Passwörter stimmen nicht überein"
                },
                placeholders: {
                    newPassword: "Geben Sie Ihr neues Passwort ein",
                    confirmPassword: "Bestätigen Sie Ihr neues Passwort"
                },
                error: "Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.",
                footer: "© {{year}} applyons. Erstellt mit ❤️ von ADM."
            }
        },
        adminDashboard: {
            hello: "Hallo, {{firstName}} {{lastName}}",
            welcome: "Willkommen!",
            kpis: {
                usersTotal: "Benutzer (gesamt)",
                usersActive: "Aktiv: {{count}}",
                organizationsTotal: "Organisationen (gesamt)",
                demandesTotal: "Anfragen (gesamt)",
                demandesBreakdown: "Aufschlüsselung unten anzeigen",
                demandesNone: "Keine Anfragen",
                documentsTotal: "Dokumente (gesamt)",
                documentsTranslated: "Übersetzt: {{count}}",
                transactionsTotal: "Transaktionen (gesamt)",
                transactionsBreakdown: "Aufschlüsselung unten anzeigen",
                paymentsTotal: "Zahlungen (gesamt)",
                paymentsBreakdown: "Aufschlüsselung unten anzeigen",
                abonnementsTotal: "Abonnements",
                abonnementsActive: "Aktiv: {{active}} · Läuft bald ab: {{expiring}}",
                contactsTotal: "Kontakte (Nachrichten)"
            },
            breakdowns: {
                usersByRole: "Aufschlüsselung nach Benutzerrollen",
                orgsByType: "Aufschlüsselung nach Organisationstypen",
                demandesByStatus: "Anfragen nach Status",
                transactionsByStatus: "Transaktionen nach Status",
                paymentsByStatus: "Zahlungen nach Status"
            },
            empty: {
                noItems: "— Keine Elemente —",
                noData: "Keine Daten anzuzeigen.",
                freeSpace: "Freier Platz für ein Diagramm/aktuelle Aktivität"
            },
            error: "Fehler beim Abrufen der Statistiken"
        },
        traducteurDashboard: {
            hello: "Hallo, {{firstName}} {{lastName}}",
            welcome: "Willkommen!",
            kpis: {
                usersTotal: "Benutzer (gesamt)",
                usersActive: "Aktiv: {{count}}",
                organizationsTotal: "Organisationen (gesamt)",
                demandesTotal: "Anfragen (gesamt)",
                demandesBreakdown: "Aufschlüsselung unten anzeigen",
                demandesNone: "Keine Anfragen",
                documentsTotal: "Dokumente (gesamt)",
                documentsTranslated: "Übersetzt: {{count}}",
                transactionsTotal: "Transaktionen (gesamt)",
                transactionsBreakdown: "Aufschlüsselung unten anzeigen",
                paymentsTotal: "Zahlungen (gesamt)",
                paymentsBreakdown: "Aufschlüsselung unten anzeigen",
                abonnementsTotal: "Abonnements",
                abonnementsActive: "Aktiv: {{active}} · Läuft bald ab: {{expiring}}",
                contactsTotal: "Kontakte (Nachrichten)"
            },
            breakdowns: {
                usersByRole: "Aufschlüsselung nach Benutzerrollen",
                orgsByType: "Aufschlüsselung nach Organisationstypen",
                demandesByStatus: "Anfragen nach Status",
                transactionsByStatus: "Transaktionen nach Status",
                paymentsByStatus: "Zahlungen nach Status"
            },
            empty: {
                noItems: "— Keine Elemente —",
                noData: "Keine Daten anzuzeigen.",
                freeSpace: "Freier Platz für ein Diagramm/aktuelle Aktivität"
            },
            error: "Fehler beim Abrufen der Statistiken"
        }
    },
    zh: {
        auth: {
            login: {
                title: "登录",
                email: "电子邮件地址：",
                password: "密码：",
                rememberMe: "记住我",
                forgotPassword: "忘记密码？",
                loginButton: "登录",
                loggingIn: "正在登录...",
                noAccount: "没有账户？",
                signup: "注册",
                errorNoToken: "未收到令牌。请重试。",
                errorLogin: "电子邮件或密码不正确。请重试。",
                showPassword: "显示密码",
                hidePassword: "隐藏密码",
                footer: "© {{year}} applyons. 由 AuthenticPage 制作。"
            },
            signup: {
                title: "创建账户",
                personalInfo: "个人信息",
                firstName: "名字 *",
                lastName: "姓氏 *",
                gender: "性别 *",
                birthPlace: "出生国家 *",
                birthDate: "出生日期 *",
                email: "电子邮件地址 *",
                phone: "电话",
                country: "国家 *",
                address: "地址",
                accountType: "账户类型 *",
                password: "密码 *",
                confirmPassword: "确认密码 *",
                minPassword: "至少6个字符",
                orgInfo: {
                    institut: "机构信息",
                    traducteur: "代理机构信息",
                    banque: "银行信息"
                },
                orgName: "组织名称 *",
                orgType: "组织类型 *",
                orgEmail: "组织电子邮件 *",
                orgPhone: "组织电话",
                orgWebsite: "网站（可选）",
                orgAddress: "组织地址",
                orgNote: "注意：您将自动成为此组织的管理员。",
                cancel: "取消",
                login: "登录",
                createAccount: "创建我的账户",
                createAccountAndOrg: "创建账户和组织",
                creating: "正在注册...",
                success: "注册成功！请检查您的电子邮件以激活您的账户。",
                errors: {
                    firstNameRequired: "名字是必需的。",
                    lastNameRequired: "姓氏是必需的。",
                    genderRequired: "性别是必需的。",
                    birthPlaceRequired: "出生国家是必需的。",
                    birthDateRequired: "出生日期是必需的。",
                    birthDateInvalid: "无效的出生日期。",
                    emailRequired: "电子邮件是必需的。",
                    emailInvalid: "无效的电子邮件。",
                    passwordRequired: "密码是必需的。",
                    passwordMin: "至少6个字符。",
                    passwordMismatch: "密码不匹配。",
                    orgNameRequired: "组织名称是必需的。",
                    orgTypeRequired: "组织类型是必需的。",
                    orgEmailRequired: "组织电子邮件是必需的。",
                    orgEmailInvalid: "无效的组织电子邮件。"
                },
                roles: {
                    DEMANDEUR: "申请人",
                    INSTITUT: "学院/学校/公司",
                    TRADUCTEUR: "翻译员/代理机构",
                    BANQUE: "银行/金融机构"
                },
                orgTypes: {
                    UNIVERSITE: "大学",
                    COLLEGE: "学院",
                    LYCEE: "高中",
                    ENTREPRISE: "公司",
                    TRADUCTEUR: "翻译代理机构",
                    BANQUE: "银行"
                },
                genders: {
                    MALE: "男",
                    FEMALE: "女",
                    OTHER: "其他"
                },
                placeholders: {
                    firstName: "张",
                    lastName: "三",
                    email: "zhangsan@example.com",
                    phone: "+86 123 4567 8900",
                    address: "123 主街，城市",
                    orgNameInstitut: "您的机构名称",
                    orgNameTraducteur: "您的代理机构名称",
                    orgNameBanque: "您的银行名称",
                    orgEmail: "contact@organization.com",
                    orgPhone: "+86 123 4567 8900",
                    orgWebsite: "https://organization.com",
                    orgAddress: "完整组织地址",
                    selectType: "选择类型"
                }
            },
            resetPassword: {
                title: "重置密码",
                subtitle: "输入您的电子邮件地址，我们将向您发送重置链接。",
                email: "电子邮件地址：",
                sendLink: "发送链接",
                sending: "正在发送...",
                login: "登录",
                success: "已发送密码重置电子邮件。",
                error: "发送密码重置电子邮件时出错。",
                footer: "© {{year}} applyons. 由 AuthenticPage 制作。"
            },
            newPassword: {
                title: "新密码",
                subtitle: "请输入您的新密码",
                newPassword: "新密码",
                confirmPassword: "确认密码",
                change: "更改密码",
                changing: "正在更改...",
                rememberPassword: "还记得您的密码？",
                login: "登录",
                success: "密码已更改！",
                successSubtitle: "您将被重定向到登录页面。",
                errors: {
                    passwordRequired: "密码是必需的",
                    passwordMin: "密码必须包含至少8个字符",
                    passwordLowercase: "密码必须包含至少一个小写字母",
                    passwordUppercase: "密码必须包含至少一个大写字母",
                    passwordNumber: "密码必须包含至少一个数字",
                    confirmRequired: "请确认您的密码",
                    confirmMismatch: "密码不匹配"
                },
                placeholders: {
                    newPassword: "输入您的新密码",
                    confirmPassword: "确认您的新密码"
                },
                error: "重置密码时出错。请重试。",
                footer: "© {{year}} applyons. 由 ADM 用 ❤️ 制作。"
            }
        },
        adminDashboard: {
            hello: "你好，{{firstName}} {{lastName}}",
            welcome: "欢迎！",
            kpis: {
                usersTotal: "用户（总计）",
                usersActive: "活跃：{{count}}",
                organizationsTotal: "组织（总计）",
                demandesTotal: "请求（总计）",
                demandesBreakdown: "查看下面的分类",
                demandesNone: "无请求",
                documentsTotal: "文档（总计）",
                documentsTranslated: "已翻译：{{count}}",
                transactionsTotal: "交易（总计）",
                transactionsBreakdown: "查看下面的分类",
                paymentsTotal: "付款（总计）",
                paymentsBreakdown: "查看下面的分类",
                abonnementsTotal: "订阅",
                abonnementsActive: "活跃：{{active}} · 即将到期：{{expiring}}",
                contactsTotal: "联系人（消息）"
            },
            breakdowns: {
                usersByRole: "用户角色分类",
                orgsByType: "组织类型分类",
                demandesByStatus: "按状态的请求",
                transactionsByStatus: "按状态的交易",
                paymentsByStatus: "按状态的付款"
            },
            empty: {
                noItems: "— 无项目 —",
                noData: "没有要显示的数据。",
                freeSpace: "图表/最近活动的自由空间"
            },
            error: "获取统计信息时出错"
        },
        traducteurDashboard: {
            hello: "你好，{{firstName}} {{lastName}}",
            welcome: "欢迎！",
            kpis: {
                usersTotal: "用户（总计）",
                usersActive: "活跃：{{count}}",
                organizationsTotal: "组织（总计）",
                demandesTotal: "请求（总计）",
                demandesBreakdown: "查看下面的分类",
                demandesNone: "无请求",
                documentsTotal: "文档（总计）",
                documentsTranslated: "已翻译：{{count}}",
                transactionsTotal: "交易（总计）",
                transactionsBreakdown: "查看下面的分类",
                paymentsTotal: "付款（总计）",
                paymentsBreakdown: "查看下面的分类",
                abonnementsTotal: "订阅",
                abonnementsActive: "活跃：{{active}} · 即将到期：{{expiring}}",
                contactsTotal: "联系人（消息）"
            },
            breakdowns: {
                usersByRole: "用户角色分类",
                orgsByType: "组织类型分类",
                demandesByStatus: "按状态的请求",
                transactionsByStatus: "按状态的交易",
                paymentsByStatus: "按状态的付款"
            },
            empty: {
                noItems: "— 无项目 —",
                noData: "没有要显示的数据。",
                freeSpace: "图表/最近活动的自由空间"
            },
            error: "获取统计信息时出错"
        }
    }
};

// Fonction pour fusionner récursivement les objets
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// Mettre à jour tous les fichiers de traduction
const languages = ['fr', 'en', 'es', 'it', 'de', 'zh'];

languages.forEach(lang => {
    const filePath = path.join(translationsDir, `${lang}.json`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Fusionner les nouvelles traductions
        const newData = deepMerge(data, translations[lang]);
        
        // Écrire le fichier mis à jour
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 4) + '\n', 'utf8');
        console.log(`✓ ${lang}.json mis à jour`);
    } catch (error) {
        console.error(`✗ Erreur lors de la mise à jour de ${lang}.json:`, error.message);
    }
});

console.log('\n✅ Toutes les traductions ont été ajoutées avec succès!');

