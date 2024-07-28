import * as Yup from "yup";

export const signInSchema = Yup.object({
  email: Yup.string()
    .email("Неверный формат адреса электронной почты")
    .required("Поле обязательно к заполнению")
    .min(3, 'Почтовый адрес слишком короткий - минимум 3 символа')
    .max(50, "Максимальная длина - 100 символов"),
  password: Yup.string()
    .required("Поле обязательно!")
    .min(8, "Пароль слишком короткий - минимум 3 символа")
    .max(50, "Максимальная длина - 100 символов"),
});

export const resetPassword = Yup.object({
  email: Yup.string()
    .email("Неверный формат адреса электронной почты")
    .required("Поле обязательно к заполнению")
    .min(3, 'Почтовый адрес слишком короткий - минимум 3 символа')
    .max(50, "Максимальная длина - 100 символов"),
});

export const newPassword = Yup.object({
  password: Yup.string()
    .required("Поле обязательно!")
    .min(8, "Пароль слишком короткий - минимум 8 символа")
    .max(100, "Максимальная длина - 100 символов")
    .test('valid-password', 'Пароль должен содержать заглавные и строчные буквы, цифры, пробелы и специальные символы', (value) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*-?&])/.test(value);
    }),
});

export const signUpSchema = Yup.object({
  username: Yup.string()
    .required("Поле обязательно!")
    .min(3, 'Минимальная длина - 3 символа')
    .max(100, "Максимальная длина - 100 символов"),
  password: Yup.string()
    .required("Поле обязательно!")
    .min(8, "Пароль слишком короткий - минимум 8 символа")
    .max(100, "Максимальная длина - 100 символов")
    .test('valid-password', 'Пароль должен содержать заглавные и строчные буквы, цифры, пробелы и специальные символы', (value) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*-?&])/.test(value);
    }),
  email: Yup.string()
    .email("Неверный формат адреса электронной почты")
    .required("Поле обязательно к заполнению")
    .min(3, 'Почтовый адрес слишком короткий - минимум 3 символа')
    .max(50, "Максимальная длина - 100 символов"),
});

export const noteSchema = Yup.object({
    title: Yup.string()
        .required("Поле обязательно!")
        .min(3, 'Минимальная длина - 3 символа')
        .max(1000, "Максимальная длина - 100 символов"),
    content: Yup.string()
        .required("Поле обязательно!")
        .min(3, 'Минимальная длина - 3 символа')
        .max(30000, "Максимальная длина - 30000 символов"),
    journal: Yup.string()
        .required("Поле обязательно!")
        .test('is-valid-journal', 'Неверный формат журнала', (value) => {
            try {
                const journal = JSON.parse(value);
                return journal && typeof journal.title === 'string' && typeof journal.journal_id === 'number';
            } catch {
                return false;
            }
        }),
    tags: Yup.array()
        .of(
            Yup.string()
                .required("Поле обязательно!")
                .test('is-valid-tag', 'Неверный формат тега', (value) => {
                    try {
                        const tag = JSON.parse(value);
                        return tag && typeof tag.title === 'string' && typeof tag.tag_id === 'number';
                    } catch {
                        return false;
                    }
                })
        )
});

export const journalSchema = Yup.object({
  title: Yup.string()
    .required("Поле обязательно!")
    .min(1, 'Минимальная длина - 1 символа')
    .max(100, "Максимальная длина - 100 символов"),
  description: Yup.string()
    .max(1000, "Максимальная длина - 100 символов"),
  emoji: Yup.object({
    emojiValue: Yup.string()
        .required("Поле обязательно!")
        .min(1, 'Выберите emoji')
        .max(2, ""),
    emojiLink: Yup.string()
        .required("Поле обязательно!")
        .min(1, "")
        .max(200, "")
  })
});

export const tagSchema = Yup.object({
  title: Yup.string()
    .required("Поле обязательно!")
    .min(1, 'Минимальная длина - 1 символа')
    .max(100, "Максимальная длина - 100 символов"),
});

export const feedbackSchema = Yup.object({
  title: Yup.string()
    .required("Поле обязательно!")
    .min(3, 'Минимальная длина - 3 символа')
    .max(100, "Максимальная длина - 100 символов"),
  content: Yup.string()
    .required("Поле обязательно!")
    .min(3, 'Минимальная длина - 3 символа')
    .max(5000, "Максимальная длина - 5000 символов"),
});

export const usernameSchema = Yup.object({
  title: Yup.string()
    .required("Поле обязательно!")
    .min(3, 'Минимальная длина - 3 символа')
    .max(100, "Максимальная длина - 100 символов"),
})

export const emailSchema = Yup.object({
  title: Yup.string()
    .email("Неверный формат адреса электронной почты")
    .required("Поле обязательно к заполнению")
    .min(3, 'Почтовый адрес слишком короткий - минимум 3 символа')
    .max(50, "Максимальная длина - 100 символов"),
})

export const passwordSchema = Yup.object({
  newPassword: Yup.string()
    .required("Поле обязательно!")
    .min(8, "Пароль слишком короткий - минимум 8 символа")
    .max(50, "Максимальная длина - 100 символов")
    .test('valid-password', 'Пароль должен содержать заглавные и строчные буквы, цифры, пробелы и специальные символы', (value) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*-?&])/.test(value);
    }),
  oldPassword: Yup.string()
    .required("Поле обязательно!")
    .min(8, "Пароль слишком короткий - минимум 8 символа")
    .max(50, "Максимальная длина - 100 символов")
})