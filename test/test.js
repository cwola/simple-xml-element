
(async (_g) => {
const xml = `<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/">
<Control>
    <Title>震源・震度に関する情報</Title>
    <DateTime>2023-11-18T08:30:42Z</DateTime>
    <Status>通常</Status>
    <EditorialOffice>大阪管区気象台</EditorialOffice>
    <PublishingOffice>気象庁</PublishingOffice>
</Control>
<Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/">
    <Title>震源・震度情報</Title>
    <ReportDateTime>2023-11-18T17:30:00+09:00</ReportDateTime>
    <TargetDateTime>2023-11-18T17:30:00+09:00</TargetDateTime>
    <EventID>20231118172759</EventID>
    <InfoType>発表</InfoType>
    <Serial>1</Serial>
    <InfoKind>地震情報</InfoKind>
    <InfoKindVersion>1.0_1</InfoKindVersion>
    <Headline>
        <Text>１８日１７時２７分ころ、地震がありました。</Text>
    </Headline>
</Head>
<Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/">
    <Earthquake>
        <OriginTime>2023-11-18T17:27:00+09:00</OriginTime>
        <ArrivalTime>2023-11-18T17:27:00+09:00</ArrivalTime>
        <Hypocenter>
            <Area>
                <Name>熊本県熊本地方</Name>
                <Code type="震央地名">741</Code>
                <jmx_eb:Coordinate description="北緯３２．５度　東経１３０．７度　深さ　１０ｋｍ" datum="日本測地系">+32.5+130.7-10000/</jmx_eb:Coordinate>
            </Area>
        </Hypocenter>
        <jmx_eb:Magnitude type="Mj" description="Ｍ２．８">2.8</jmx_eb:Magnitude>
    </Earthquake>
    <Intensity>
        <Observation>
            <CodeDefine>
                <Type xpath="Pref/Code">地震情報／都道府県等</Type>
                <Type xpath="Pref/Area/Code">地震情報／細分区域</Type>
                <Type xpath="Pref/Area/City/Code">気象・地震・火山情報／市町村等</Type>
                <Type xpath="Pref/Area/City/IntensityStation/Code">震度観測点</Type>
            </CodeDefine>
            <MaxInt>2</MaxInt>
            <Pref><Name>熊本県</Name><Code>43</Code><MaxInt>2</MaxInt>
                <Area><Name>熊本県熊本</Name><Code>741</Code><MaxInt>2</MaxInt>
                    <City><Name>八代市</Name><Code>4320200</Code><MaxInt>2</MaxInt>
                        <IntensityStation><Name>八代市泉支所＊</Name><Code>4320234</Code><Int>2</Int></IntensityStation>
                        <IntensityStation><Name>八代市平山新町</Name><Code>4320200</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>八代市泉町</Name><Code>4320202</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>八代市新地町＊</Name><Code>4320221</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>八代市千丁町＊</Name><Code>4320230</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>八代市鏡町＊</Name><Code>4320231</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>八代市東陽町＊</Name><Code>4320233</Code><Int>1</Int></IntensityStation>
                    </City>
                    <City><Name>宇城市</Name><Code>4321300</Code><MaxInt>1</MaxInt>
                        <IntensityStation><Name>宇城市不知火町＊</Name><Code>4321330</Code><Int>1</Int></IntensityStation>
                        <IntensityStation><Name>宇城市小川町＊</Name><Code>4321336</Code><Int>1</Int></IntensityStation>
                    </City>
                    <City><Name>熊本美里町</Name><Code>4334800</Code><MaxInt>1</MaxInt>
                        <IntensityStation><Name>熊本美里町永富＊</Name><Code>4334820</Code><Int>1</Int></IntensityStation>
                    </City>
                    <City><Name>甲佐町</Name><Code>4344400</Code><MaxInt>1</MaxInt>
                        <IntensityStation><Name>甲佐町豊内＊</Name><Code>4344431</Code><Int>1</Int></IntensityStation>
                    </City>
                    <City><Name>氷川町</Name><Code>4346800</Code><MaxInt>1</MaxInt>
                        <IntensityStation><Name>氷川町島地＊</Name><Code>4346830</Code><Int>1</Int></IntensityStation>
                    </City>
                </Area>
            </Pref>
        </Observation>
    </Intensity>
    <Comments>
        <ForecastComment codeType="固定付加文">
            <Text>この地震による津波の心配はありません。</Text>
            <Code>0215</Code>
        </ForecastComment>
        <VarComment codeType="固定付加文">
            <Text>＊印は気象庁以外の震度観測点についての情報です。</Text>
            <Code>0262</Code>
        </VarComment>
    </Comments>
</Body>
</Report>`;

const xmlElement = simpleXmlLoadString(xml);

// 震源・震度に関する情報
console.log(xmlElement.Report.Control.Title.$text());
// １８日１７時２７分ころ、地震がありました。
console.log(xmlElement.Report.Head.Headline.Text.$text());
// 北緯３２．５度　東経１３０．７度　深さ　１０ｋｍ (日本測地系)
let description = '',
    datum = '';
xmlElement.Report.Body.Earthquake.Hypocenter.Area.Coordinate.$attributes().forEach(attr => {
    if (attr.$localName() === 'description') {
        description = attr.$text();
    } else if (attr.$localName() === 'datum') {
        datum = attr.$text();
    }
});
console.log(description + ' (' + datum + ')');
// 0
console.log(xmlElement.$depth());
// 1
console.log(xmlElement.Report.$depth());
// 4
console.log(xmlElement.Report.Body.Intensity.Observation.$depth());
console.log(xmlElement.$asXML());
console.log(xmlElement.Report.Control.$asXML());

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
// [SimpleXmlElementNode(Report)]
console.log(xmlElement.$xpath('/jmx:Report'));
// +32.5+130.7-10000/
console.log(xmlElement.$xpath('/jmx:Report/jmx_b:Body/jmx_b:Earthquake/jmx_b:Hypocenter/jmx_b:Area/jmx_eb:Coordinate/text()'));
// 地震情報／都道府県等
console.log(xmlElement.$xpath('/jmx:Report/jmx_b:Body/jmx_b:Intensity/jmx_b:Observation/jmx_b:CodeDefine/jmx_b:Type[@xpath=\'Pref/Code\']/text()'));
// [SimpleXmlElementNode(Type), SimpleXmlElementNode(Type), SimpleXmlElementNode(Type), SimpleXmlElementNode(Type)]
console.log(xmlElement.Report.Body.Intensity.Observation.$xpath('jmx_b:CodeDefine/jmx_b:Type'));
// [SimpleXmlElementNode(Type), SimpleXmlElementNode(Type), SimpleXmlElementNode(Type), SimpleXmlElementNode(Type)]
console.log(xmlElement.Report.Body.Intensity.Observation.$xpath('/jmx_b:CodeDefine/jmx_b:Type'));
// 震度観測点
console.log(xmlElement.Report.Body.Intensity.$xpath('//jmx_b:Type')[3].$text());

console.log('=== MODIFY TEST ===');

xmlElement.Report.Body.Comments.$remove();
// [SimpleXmlElementNode(Earthquake), SimpleXmlElementNode(Intensity)]
console.log(xmlElement.Report.Body.$children());
// [SimpleXmlTextNode, SimpleXmlElementNode(Earthquake), SimpleXmlTextNode, SimpleXmlElementNode(Intensity), SimpleXmlTextNode]
console.log(xmlElement.Report.Body.$childNodes());

delete xmlElement.Report.Body.Intensity.Observation.Pref.Area.City[2];
// 0: 八代市 (4320200)
// 1: 宇城市 (4321300)
// 2: 甲佐町 (4344400)
// 3: 氷川町 (4346800)
xmlElement.Report.Body.Intensity.Observation.Pref.Area.City.forEach((city, index) => {
    console.log(`${index}: ${city.Name.$text()} (${city.Code.$text()})`);
});
// true
console.log(Array.isArray(xmlElement.Report.Body.Intensity.Observation.Pref.Area.City));
delete xmlElement.Report.Body.Intensity.Observation.Pref.Area.City[1];
delete xmlElement.Report.Body.Intensity.Observation.Pref.Area.City[1];
delete xmlElement.Report.Body.Intensity.Observation.Pref.Area.City[1];
// false
console.log(Array.isArray(xmlElement.Report.Body.Intensity.Observation.Pref.Area.City));
// true
console.log(xmlElement.Report.Body.Intensity.Observation.Pref.Area.City instanceof SimpleXmlElementNode);

xmlElement.Report.Body.Earthquake.Hypocenter.Area.Coordinate.$attributes().forEach(attr => {
    attr.$setValue(attr.$text() + ' (modified)');
});

// 最初の状態から
// ・'Report.Body.Comments' が削除されている
// ・'xmlElement.Report.Body.Intensity.Observation.Pref.Area.City' が八代市 (4320200)のみになっている
// ・'Report.Body.Earthquake.Hypocenter.Area.Coordinate' の属性値の後ろに '(modified)' が追加されている
console.log(xmlElement.$asXML());

// SyntaxError : TREE cannot be added directly. Use $addChild().
xmlElement.Report.Head = '';
})(window);