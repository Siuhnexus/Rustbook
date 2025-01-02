<div class="container pt-4 pb-12">
    <h1>Willkommen</h1>
    <p>Hallo Papa,</p>
    <p>Dieses Jahr gibt es etwas digitales. Ich habe ja schon vor ein paar Wochen mit dir über das Rust-Buch gesprochen und wie sehr mich diese Sprache begeistert. Obwohl du da nicht so lernmotiviert wirktest, habe ich mich dazu entschlossen, dir einen kleinen Anstoß zu geben. Zur Digitalversion des Rust-Buches selbst habe ich dir diese Anmerkungen in die Anwendung gepackt, um hoffentlich deine Leseerfahrung zu verbessern.</p>
    <p>Aber zunächst zu den Vor- und Nachteilen von Rust. Einerseits ist die Sprache memory safe, ohne zu große Performanceeinbußen zu erzeugen. Sobald man die besonderen Regeln der Sprache kennt, fühlt sich Rust außerdem wie eine high level Sprache an, obwohl sie es nicht ist. Andererseits machen die ownership- und borrowing-Regeln einem das Leben in einigen Fällen ziemlich schwer und die kompilierten Dateien verbrauchen — vermutlich durch den besonderen Umgang mit generics — relativ viel Speicherplatz.</p>
    <p>Nun zum Buch selbst. Ich habe bisher die ersten 11 Kapitel gelesen und kann mit dem Wissensstand folgendes empfehlen:</p>
    <ul>
        <li>Kapitel 1 sollte man überfliegen.</li>
        <li>Kapitel 2 hat wenig Realitätsbezug, kann also ganz gut übersprungen werden.</li>
        <li>Bei Kapitel 3 sollte man aus 3.1 mitnehmen, dass Variablen standardmäßig immutable sind und durch das keyword "mut" mutable werden. Außerdem kann man den Abschnitt zu Tupeln in 3.2 lesen, die sind recht nützlich. Ansonsten ist das alles bis auf das "loop" keyword in 3.5 (macht das gleiche wie "while true") bekannt.</li>
        <li>Kapitel 4 ist extrem wichtig, die enthaltenen Konzepte sind der Grund, warum Rust einfach zu programmieren ist und trotzdem schnell läuft.</li>
        <li>Kapitel 5 und 6 sollte man auch lesen.</li>
        <li>Kapitel 7 kann man überspringen, wenn man erstmal nur herumspielt. Für mein Advent of Code repository (den Link dazu findest du in der <a class="text-blue-300 underline" href="/">Übersicht</a>) war das Wissen darin aber schon sehr nützlich.</li>
        <li>Kapitel 8 ist überwiegend Standardzeug und kann übersprungen werden, ich würde es aber überfliegen.</li>
        <li>Kapitel 9 und 10 sollte man lesen.</li>
        <li>Kapitel 11 ist ganz nett, aber nicht so wichtig.</li>
    </ul>
    <p>Zu den restlichen Kapiteln kann ich nur (durch ein bisschen Programmiererfahrung fundierte) Vermutungen anstellen:</p>
    <ul>
        <li>Kapitel 12 ist vermutlich ein realitätsnäheres und daher sinnvolleres Projekt zum Durcharbeiten, aber auch dieses lässt sich überspringen, wenn einen das nicht interessiert.</li>
        <li>Kapitel 13 ist vermutlich ziemlich hilfreich, wenn man noch nicht so oft mit C#-Funktionen aus "System.Linq" wie "Select()", "Aggregate()" (die heißen in Rust natürlich anders) o. Ä. zu tun hatte, wobei die Closure-Syntax schon besonders ist. Vielleicht also zum Überfliegen.</li>
        <li>Kapitel 14 kann man vermutlich überspringen.</li>
        <li>Kapitel 15 sollte man besonders dann lesen, wenn man LinkedLists oder ähnlich komplexe Datenstrukturen braucht. Rust's Regeln zu ownership und borrowing sind für viele Datenstrukturen unproblematisch, für manche aber auch nicht. Die in diesem Kapitel vorgestellten Konzepte sorgen dafür, dass die Regeln nicht mehr beim Kompilieren, sondern zur Laufzeit geprüft werden, was in manchen Fällen unumgänglich ist.</li>
        <li>Kapitel 16 ist vermutlich ziemlich hilfreich.</li>
        <li>Kapitel 17 ist (wenig überraschend) eher akademisch oder designphilosophisch, kann aber bestimmt für einen C#-Programmierer wie dich interessant sein.</li>
        <li>Kapitel 18 kann ich nicht einschätzen.</li>
        <li>Kapitel 19 braucht man wahrscheinlich erst, wenn man ganz tief im Sumpf feststeckt.</li>
        <li>Kapitel 20 ist vermutlich ziemlich interessant.</li>
    </ul>
    <p>Generell gilt: Nach jedem Codeblock wird in den folgenden 1-2 Absätzen der gesamte Code erklärt, was ich ein bisschen nervig finde. Die Absätze kann man meistens überspringen. Außerdem ist das Buch natürlich so geschrieben, dass alle es verstehen können. Darauf muss man sich einstellen.</p>
    <p>Ich wünsche dir viel Spaß beim Lesen.</p>
    <p class="!mt-8">Frohe Weihnachten,</p>
    <p>Bente</p>
</div>
