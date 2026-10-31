---
layout: default
title: Статьи
description: "Реальные инженерные кейсы разработки с coding agents: что я делегирую, где агенты ошибаются, как проверяю их работу. Android и не только."
nav_order: 7
translation_key: articles
permalink: /articles/
---

# Статьи

Реальные инженерные кейсы о разработке с coding agents: что я делегирую, где агенты ошибаются, как проверяю их работу и что остаётся ответственностью инженера.
Исходники статей, факты и хронология расследований хранятся рядом с каждой
публикацией в репозитории.

## От STL к BREP: как AI-агент научился восстанавливать геометрию, а не просто сшивать треугольники

Инструмент `convert_mesh_to_brep` для FreeCAD MCP восстанавливает из STL плоскости и цилиндры вместо гранёных поверхностей: 2884 треугольника → 31 грань. Результаты на шести деталях, границы применимости и просьба прислать STL, на котором он сломается.

[Читать статью]({{ '/articles/freecad-mcp-mesh-to-brep/' | relative_url }}){: .btn .btn-blue }

[Проект freecad-mcp](https://github.com/hram/freecad-mcp)

## Когда AI-агент перестал просто писать код и начал испытывать всю систему

ESP32, Android-планшет и Kotlin BFF стали единым испытательным стендом:
агент вызывал обрывы Bluetooth, проверял восстановление записи и отправку
WAV на сервер. Длительные прогоны, найденные ошибки и границы результата.

[Читать статью]({{ '/articles/esp32-android-audio-badge/' | relative_url }}){: .btn .btn-blue }

## Агент умел двигать детали, но не умел собирать механизм

Как я доработал FreeCAD MCP после полутора часов сборки через чат: Claude и Codex
самостоятельно собрали Pan–Tilt, но геометрические проверки не заметили
перепутанные боковины. Разбор по журналам, моделям и измерениям.

[Читать статью]({{ '/articles/freecad-mcp/' | relative_url }}){: .btn .btn-blue }

[Проект freecad-mcp](https://github.com/hram/freecad-mcp)

## Не пиши промпт. Пройди интервью.

Как я попросил Codex провести интервью вместо технического задания: час вопросов про документ-камеру из Android-телефона, а затем агент сам написал приложение и связал его с PaperLedger.

[Читать статью]({{ '/articles/mobile-ledger/' | relative_url }}){: .btn .btn-blue }

## Мой Git Flow, часть 3: я перестал красить ячейки в Confluence, стадию релиза теперь считают портал и MCP

Как стадия релиза вычисляется по слитым merge request: портал вместо таблицы в
Confluence и MCP-инструмент, по которому coding agent узнаёт, из какой ветки
начинать задачу. И где этот алгоритм может ошибиться.

[Читать статью]({{ '/articles/hram-git-flow-ai/' | relative_url }}){: .btn .btn-blue }

## Мой Git Flow, часть 2: я устал следить за регламентами и поручил это GitLab

Как имя версионной ветки `стадия/версия` стало основой проверок merge request,
выбора сборки и контура, доставки, release notes, уведомлений и статусов в
Jira. И что в этом процессе всё равно остаётся за человеком.

[Читать статью]({{ '/articles/hram-git-flow-ci/' | relative_url }}){: .btn .btn-blue }

## GitFlow как цемент между планированием и разработкой

Мой вариант GitFlow, которым я пользуюсь больше десяти лет: у каждого релиза
своя цепочка веток `стадия/версия`, новая версия стартует от текущей стадии
самой новой, исправления идут вперёд. Ветки отражают план доставки, а состав
релиза не пересобирают через cherry-pick и revert.

[Читать статью]({{ '/articles/hram-git-flow-base/' | relative_url }}){: .btn .btn-blue }

## Я хотел распознать три колонки накладной

OCR оказался самой простой частью: обвал PaddleOCR на реальном фото с
телефона, выравнивание по сетке таблицы вместо листа бумаги (подсказка из
старого проекта с судоку) и tight crop вместо новой модели.

[Читать статью]({{ '/articles/paper-ledger/' | relative_url }}){: .btn .btn-blue }

## Фича, за которую я бы сам не взялся

Как coding agent добавил Jetpack Compose в Android UI Renderer MCP: сам
разобрал Kotlin-сигнатуры, собрал Compose probe и semantics tree, а я задавал
границы решения и поймал ошибки, которые не видны по одному PNG.

[Читать статью]({{ '/articles/android-ui-renderer-compose/' | relative_url }}){: .btn .btn-blue }

[Проект android-ui-renderer-mcp](https://github.com/hram/android-ui-renderer-mcp)

## Одного layout оказалось мало

Как coding agent получил составной Android-экран — Activity с тулбаром, Fragment,
строки RecyclerView и loading overlay — из настоящего XML с явно заданными данными,
без запуска приложения, и зачем рядом с каждым рендером лежит рецепт для повтора.

[Читать статью]({{ '/articles/android-ui-renderer-composed-screens/' | relative_url }}){: .btn .btn-blue }

[Проект android-ui-renderer-mcp](https://github.com/hram/android-ui-renderer-mcp)

## Я не умел делать A/B-тесты

Как AI-агент помог спроектировать аналитику A/B/C-эксперимента нового Android-сканера
ценников, связать Firebase с BigQuery и разбирать реальные сбои.

[Читать статью]({{ '/articles/price-tag-scanner-ab/' | relative_url }}){: .btn .btn-blue }

## Я ускорил разработку AI-агентами. Узким местом стало тестирование

Зачем AI-агенту MCP для Allure TestOps, если человек может просто открыть
браузер — и как агент начал переносить смысл между кодом, TMS и MockServer.

[Читать статью]({{ '/articles/allure-testops-mcp/' | relative_url }}){: .btn .btn-blue }

[Проект allure-testops-mcp](https://github.com/hram/allure-testops-mcp)

## Мне не нужен был ещё один мониторинг АЗС

Как личный портал для семьи перестал быть мониторингом бензина и стал помощником,
который решает «ехать за АИ-95 или ждать» — и молчит, пока это не нужно.

[Читать статью]({{ '/articles/gdebenz/' | relative_url }}){: .btn .btn-blue }

## Я хотел улучшить резюме с AI

Почему задача «обновить резюме с AI» превратилась в приватную базу фактов о
собственной карьере — и чем агент оказался полезнее, когда не писал текст, а
задавал вопросы про метрики.

[Читать статью]({{ '/articles/career-portal/' | relative_url }}){: .btn .btn-blue }

## Я отдал разработку мессенджера двум AI

Как ChatGPT и Codex помогли собрать self-hosted KMP-мессенджер, почему продукт
прожил неделю и почему первую статью о нём не приняла модерация Habr.

[Читать статью]({{ '/articles/family-messenger/' | relative_url }}){: .btn .btn-blue }

[Проект family-messenger](https://github.com/hram/family-messenger)

## Статья про family-messenger которой не случилось

Сохранённая версия первой статьи о Family Messenger, которую не приняла
модерация Habr.

[Читать статью]({{ '/articles/family-messenger-habr/' | relative_url }}){: .btn .btn-blue }

## От бумажной карты до проблемного сплита

Как я соединил скан спортивной карты, GPS-трек и официальный протокол, чтобы
находить повторяющиеся ошибки ориентирования на конкретных этапах дистанции.

[Читать статью]({{ '/articles/orienteering/' | relative_url }}){: .btn .btn-blue }

[Проект orienteering](https://github.com/hram/orienteering)

## Как я сделал AI персональным тренером

Почему после пробежки мне перестало хватать скриншотов из Mi Fitness — и как
личный портал дал AI-тренеру историю тренировок, показатели восстановления и
контекст самочувствия.

[Читать статью]({{ '/articles/running-portal/' | relative_url }}){: .btn .btn-blue }

[Проект running-portal](https://github.com/hram/running-portal)

## Android UI и coding agent

Почему screenshot Android-интерфейса оказался для coding agent только первым
шагом — и как View tree позволил проверять геометрию layout без ручного
просмотра каждого результата.

[Читать статью]({{ '/articles/android-ui-renderer-mcp/' | relative_url }}){: .btn .btn-blue }

[Проект android-ui-renderer-mcp]({{ '/projects/android-ui-renderer-mcp.html' | relative_url }})

## CameraX и coding agent

Как мы расследовали рассинхронизацию `Preview` и `ImageAnalysis` при повороте
Android-планшета — и почему остановили первое, вполне работающее решение с
задержкой.

[Читать статью]({{ '/articles/camerax-agent/' | relative_url }}){: .btn .btn-blue }

[Проект CameraX agent]({{ '/projects/camerax-agent.html' | relative_url }})
