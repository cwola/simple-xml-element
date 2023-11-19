
(async (_g) => {
const xml = `<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/">
<Control>
<constructor>constructor</constructor>
<then>then</then>
<hasOwnProperty>hasOwnProperty</hasOwnProperty>
<Title>震度速報</Title>
<DateTime>2023-11-11T13:04:12Z</DateTime>
<Status>通常</Status>
<EditorialOffice>大阪管区気象台</EditorialOffice>
<PublishingOffice>気象庁</PublishingOffice>
</Control>
<Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/">
<Title>震度速報</Title>
<ReportDateTime>2023-11-11T22:04:00+09:00</ReportDateTime>
<TargetDateTime>2023-11-11T22:02:00+09:00</TargetDateTime>
<EventID>20231111220242</EventID>
<InfoType>発表</InfoType>
<Serial/>
<InfoKind>震度速報</InfoKind>
<InfoKindVersion>1.0_1</InfoKindVersion>
<Headline>
<Text>１１日２２時０２分ころ、地震による強い揺れを感じました。震度３以上が観測された地域をお知らせします。</Text>
<Information type="震度速報">
<Item>
<Kind><Name>震度４</Name></Kind>
<Areas codeType="地震情報／細分区域">
<Area><Name>鹿児島県十島村</Name><Code>774</Code></Area>
</Areas>
</Item>
</Information>
</Headline>
</Head>
<Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/">
<Intensity>
<Observation>
<CodeDefine>
<Type xpath="Pref/Code">地震情報／都道府県等</Type>
<Type xpath="Pref/Area/Code">地震情報／細分区域</Type>
</CodeDefine>
<MaxInt>4</MaxInt>
<Pref>
<Name>鹿児島県</Name><Code>46</Code><MaxInt>4</MaxInt>
<Area><Name>鹿児島県十島村</Name><Code>774</Code><MaxInt>4</MaxInt></Area>
</Pref>
</Observation>
</Intensity>
<Comments>
<ForecastComment codeType="固定付加文">
<Text>今後の情報に注意してください。</Text>
<Code>0217</Code>
</ForecastComment>
</Comments>
</Body>
</Report>`;

const xmlElement = await _g.loadSimpleXmlElement(xml);

console.log(xmlElement.Report.Control.Title.$text());
console.log(xmlElement.Report.Head.Headline.Information.Item.Kind.Name.$text() + ' ' + xmlElement.Report.Head.Headline.Information.Item.Areas.Area.Name.$text());
console.log(xmlElement.Report.Body.Intensity.Observation.CodeDefine.Type[0].$attributes()[0].$text());
console.log(xmlElement.Report.Body.Intensity.Observation.CodeDefine.Type[1].$attributes()[0].$text());
console.log(xmlElement.$depth());  // 0
console.log(xmlElement.Report.$depth());  // 1
console.log(xmlElement.Report.Body.Intensity.Observation.$depth());  // 4
console.log(xmlElement.$asXML());
console.log(xmlElement.Report.Control.$asXML());
console.log(xmlElement.Report.Control.then);
console.log(xmlElement.Report.Control.constructor);
console.log(xmlElement.Report.Control.hasOwnProperty instanceof SimpleXmlElementNode);

console.log('=== XPATH TEST ===');

// 既定の名前空間を使用している場合（タグ名に明示的に名前空間を指定せず
//   <Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/">
//  のように、一括で名前空間を指定している場合）
// に$xpathメソッドを使用する場合は、$registerNSメソッドを使用してあらかじめ名前空間を設定しておくと便利です。
// (設定していない場合は、$xpathメソッドの第二引数を使用して独自に名前空間の解決を行う必要があります)
//
xmlElement.$registerNS('jmx', 'http://xml.kishou.go.jp/jmaxml1/')
        .$registerNS('jmx_ib', 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/')
        .$registerNS('jmx_b', 'http://xml.kishou.go.jp/jmaxml1/body/seismology1/')
        .$registerNS('jmx_eb', 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/');
console.log(xmlElement.$xpath('/jmx:Report'));
console.log(xmlElement.$xpath('/jmx:Report/jmx_b:Body/jmx_b:Intensity/jmx_b:Observation/jmx_b:CodeDefine/jmx_b:Type[@xpath=\'Pref/Code\']/text()'));
console.log(xmlElement.Report.Body.Intensity.Observation.$xpath('jmx_b:CodeDefine/jmx_b:Type'));
console.log(xmlElement.Report.Body.Intensity.Observation.$xpath('/jmx_b:CodeDefine/jmx_b:Type'));
console.log(xmlElement.Report.Body.Intensity.$xpath('//jmx_b:Type')[0].$text());

xmlElement.Report.Body.$remove();
console.log(xmlElement.Report.$children());

delete xmlElement.Report.Head.Headline;
console.log(xmlElement.$asXML());
// SyntaxError : TREE cannot be added directly. Use $addChild().
xmlElement.Report.Head = '';
})(window);