# Ereignis-System
Das Ereignis-System basiert auf asynchronen Iteratoren bzw. Generatoren (for await...of). Die möglichen Ereignisse müssen vorher als JSON-Schema definiert worden sein.

## Ereignisse
Die einzelnen Ereignis-Typen werden mithilfe von JSON-Schemas erstellt (siehe __Codegenerator__). Sie werden sowohl auf der Server-, als auch auf der Client-Seite verwendet.

## EventPublisher
Es gibt auf der Serverseite einen systemweiten __EventPublisher__. Dieser leitet eingehende Ereignisse direkt an den __SystemHook__ weiter. Der __SystemHook__ stellt sicher, dass die Empfänger-Agenten geladen sind und reicht das Ereignis dann an den serverseitigen __EventBroker__ weiter.

## EventBroker
Kern des Systems bildet die __EventBroker__-Klasse. Diese Klasse kann neue Ereignisse an andere Agenten weiterleiten. 
Ereignisse werden vom __EventBroker__ an sogenannte "Topic"s verteilt. "Topic"s sind durch eine numerische ID unterscheidbar.
Andere Parteien können diese "Topic"s abonnieren. Jedes Ereignis wird exakt einmal an jeden Abonnenten verteilt.

Ein __EventBroker__ kann entweder alleinstehend oder mit einem __EventRouter__ betrieben werden.

## SystemHook
Der __SystemHook__ inspiziert jedes Ereignis, welches über den systemweiten __EventPublisher__ publiziert wurde. Er führt, wie auch der serverseitige __EventPublisher__, den __EventRouter__ aus um eine Liste von Empfänger-Agenten zu erhalten. Danach erteilt er für jeden Eintrag in der Empfängerliste dem __AgentHost__ den Auftrag, sicherzustellen, dass der jeweilige Emüfänger-Agent geladen ist. Danach reicht der __SystemHook__ das Ereignis an den serverseitigen __EventBroker__ weiter.

## Emitter<T>
Wenn man ein Topic beim __EventBroker__ abonniert, wird ein neuer __Emitter<T>__ erstellt. Dieser implementiert die ___AsyncIterable<T>___-Schnittstelle und kann nur einmal gleichzeitig iteriert werden. Dass heisst, wenn mehrere Parteien an den Ereignissen interessiert sind, muss der Abonnent einen eigenen "Sub"-__EventBroker__ erstellen und die Ereignisse selbst dorthin weiterleiten. Von diesem neuen __EventBroker__ können die anderen Parteien dann ihre Ereignisse beziehen.

## EventRouter
Ein __EventBroker__ verteilt ein eingehendes Ereignis an mehrere Abonnenten. Das eingehende Ereignis hat jedoch keinen, im Vorfeld festgelegten, Empfänger. Daher nutzt der __EventBroker__ einen __EventRouter__, der die Empfängerliste vorgibt. 
Der __EventRouter__ analysiert die Inhalte der Ereignisse und leitet daraus die Empfängerliste ab. So könnte der __EventRouter__ z.B. feststellen, dass ein neuer __Eintrag__ in einer __Gruppe__ für alle __Mitglieder__ der __Gruppe__ sichtbar ist und diese ebenfalls mit auf die Empfängerliste setzen.

Achtung: _Der __EventRouter__ kann momentan nur auf der Server-Seite verwendet werden, da er eine eins-zu-eins Abbildung von "Topic"-IDs auf Agenten-IDs voraussetzt._

## AgentHost