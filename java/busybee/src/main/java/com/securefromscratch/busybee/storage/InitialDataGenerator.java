package com.securefromscratch.busybee.storage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class InitialDataGenerator {
    public static void fillWithData(List<Task> tasks) {
        List<LocalDateTime> randomPastDates = generateRandomDateTimes(15, 5);
        List<LocalDateTime> randomFutureDates = generateRandomDateTimes(10, -5);

        tasks.addAll(List.of(
                new Task(
                        "Buy ingredients for Caprese Sandwich",
                        """
                                    <ul>
                                        <li>1 fresh baguette or ciabatta roll, sliced in half</li>
                                        <li>1-2 ripe tomatoes, sliced</li>
                                        <li>Fresh mozzarella cheese, sliced</li>
                                        <li>Fresh basil leaves</li>
                                        <li>1 tbsp balsamic glaze (optional)</li>
                                        <li>Salt and pepper to taste</li>
                                        <li>Olive oil for drizzling</li>
                                    </ul>
                                """,
                        randomFutureDates.remove(randomFutureDates.size() - 1).toLocalDate(),
                        "Yariv", randomPastDates.remove(0)
                ),
                new Task(
                        "Get sticker for car",
                        "Parking inside Ariel requires sticker. You can get one at security office.",
                        LocalDate.now().plusDays(10),
                        "Ariel Security Department",
                        new String[]{"Yariv"}, randomPastDates.remove(0)
                ),
                new Task(
                        "Change closet from summer to winter",
                        "Winter is Coming",
                        LocalDate.now().plusDays(20),
                        "Ariel Security Department",
                        new String[]{"Yariv"}, randomPastDates.remove(0)
                ),
                new Task(
                        "Prepare lab report 1",
                        "Can be found at <a href='https://moodlearn.ariel.ac.il/mod/resource/view.php?id=2011102'>moodle lab report 1</a>",
                        LocalDate.now(),
                        randomFutureDates.remove(randomFutureDates.size() - 1).toLocalTime(),
                        "Yariv",
                        new String[]{"Students"}, randomPastDates.remove(0)
                )
        ));
        UUID c0_1 = tasks.get(0).addComment("Out of tomatoes in local supermarket",
                Optional.of("Wikimedia-Corona_Lockdown_Tirupur_Tamil_Nadu.jpg"), Optional.empty(),
                "Rita", randomPastDates.remove(0), Optional.empty());
        tasks.get(0).addComment("Found and bought at our favorite grocer",
                Optional.of("wikimedia_Fresh_vegetable_stall.jpg"), Optional.empty(),
                "Rami", randomPastDates.remove(0), Optional.of(c0_1));
        tasks.get(2).addComment("באמת הגיע הזמן לסדר את הבלאגן בארון", Optional.of("camera/wikipedia_Space-saving_closet.JPG"), Optional.empty(), "Or", randomPastDates.remove(0), Optional.empty());
        UUID c3_1 = tasks.get(tasks.size() - 1).addComment("מישהו יודע את התשובה לשאלה 12?", Optional.empty(), Optional.of("דוח מעבדה עקרונות תכנות מאובטח.docx"), "Nisan", randomPastDates.remove(0), Optional.empty());
        tasks.get(tasks.size() - 1).addComment("פשוט תעתיק את התוצאה מחלון הפקודה", Optional.of("screenshots/CommandWindow.png"), Optional.empty(), "Rony", randomPastDates.remove(0), Optional.of(c3_1));
        tasks.get(tasks.size() - 1).addComment("אתה מתכוון לשאלה עם ה-POST?", "Aviv", randomPastDates.remove(0), Optional.of(c3_1));
        UUID c3_2 = tasks.get(tasks.size() - 1).addComment("המחשב נתקע. מה עושים?", "Rony", randomPastDates.remove(0), Optional.empty());
    }

    public static List<LocalDateTime> generateRandomDateTimes(int numberOfDates, int daysAgo) {
        List<LocalDateTime> randomDateTimes = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pastDate = now.minusDays(daysAgo);

        long startEpoch = pastDate.atZone(ZoneId.systemDefault()).toEpochSecond();
        long endEpoch = now.atZone(ZoneId.systemDefault()).toEpochSecond();
        if (startEpoch > endEpoch) {
            long oldStartEpoch = startEpoch;
            startEpoch = endEpoch;
            endEpoch = oldStartEpoch;
        }

        for (int i = 0; i < numberOfDates; i++) {
            long randomEpoch = ThreadLocalRandom.current().nextLong(startEpoch, endEpoch + 1);
            LocalDateTime randomDateTime = LocalDateTime.ofEpochSecond(randomEpoch, 0, ZoneId.systemDefault().getRules().getOffset(now));
            randomDateTimes.add(randomDateTime);
        }

        // Sort the dates in ascending order
        randomDateTimes.sort(LocalDateTime::compareTo);

        return randomDateTimes;
    }
}
