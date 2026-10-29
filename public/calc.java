import java.util.Scanner;

public class calc {
    public static int calculateScore(int checkedBoxes, int totalQuestions) {
        return 100 - checkedBoxes;
    }

    public static String getScoreMeaning(int score) {
        if (score >= 90) {
            return "Very pure";
        } else if (score >= 80) {
            return "Fairly pure";
        } else if (score >= 70) {
            return "Average";
        } else if (score >= 60) {
            return "A bit wild";
        } else if (score >= 30) {
            return "Very experienced";
        } else {
            return "...you've lived a lot";
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter the number of checked boxes: ");
        int checkedBoxes = scanner.nextInt();

        int totalQuestions = 100;
        int score = calculateScore(checkedBoxes, totalQuestions);

        System.out.println("100 questions = 100 points");
        System.out.println("You start with 100 (meaning 100% pure)");
        System.out.println("Every box you tick, you lose 1 point");
        System.out.println("Final score = 100 - (number of boxes ticked)");
        System.out.println("Your score is: " + score + " / " + totalQuestions);
        System.out.println("Score meaning: " + getScoreMeaning(score));

        scanner.close();
    }
}
